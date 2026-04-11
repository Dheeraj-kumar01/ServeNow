const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

// Generate 6-digit OTP
const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired
const isOTPExpired = (otpExpiry) => {
  if (!otpExpiry) return true;
  return new Date() > new Date(otpExpiry);
};

// @desc    Get all requests for donor's food
// @route   GET /api/requests/donor/requests
// @access  Private (Donor only)
const getDonorRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donor: req.user._id })
      .populate('food', 'name quantity unit image pickupAddress')
      .populate('receiver', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get donor requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all claims for receiver
// @route   GET /api/requests/receiver/claims
// @access  Private (Receiver only)
const getReceiverClaims = async (req, res) => {
  try {
    const claims = await Request.find({ receiver: req.user._id })
      .populate('food', 'name quantity unit image pickupAddress')
      .populate('donor', 'name phone address')
      .sort({ createdAt: -1 });
    
    // Include OTP in response only for accepted claims
    const claimsWithOTP = claims.map(claim => {
      const claimObj = claim.toObject();
      if (claimObj.status === 'accepted' && claimObj.otp) {
        claimObj.otp = claimObj.otp; // Include OTP for accepted claims
      }
      return claimObj;
    });
    
    res.json(claimsWithOTP);
  } catch (error) {
    console.error('Get receiver claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a request (Donor)
// @route   PUT /api/requests/:id/accept
// @access  Private (Donor only)
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('food', 'name quantity unit')
      .populate('receiver', 'name phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor owns this request
    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food._id, {
      status: 'claimed'
    });

    res.json({
      success: true,
      message: 'Request accepted successfully',
      request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a request (Donor)
// @route   PUT /api/requests/:id/reject
// @access  Private (Donor only)
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor owns this request
    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = 'rejected';
    await request.save();

    // Update food status back to available
    await FoodListing.findByIdAndUpdate(request.food, {
      status: 'available',
      claimedBy: null
    });

    res.json({
      success: true,
      message: 'Request rejected',
      request
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate OTP for pickup (Donor)
// @route   POST /api/requests/:id/generate-otp
// @access  Private (Donor only)
const generateOTP = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor owns this request
    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted first' });
    }

    // Generate OTP
    const otp = generateOTPCode();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30); // OTP valid for 30 minutes

    // Save OTP to database
    request.otp = otp;
    request.otpExpiry = otpExpiry;
    await request.save();

    console.log(`OTP generated for request ${request._id}: ${otp}`);
    console.log(`OTP Expiry: ${otpExpiry}`);

    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp,
      expiry: otpExpiry
    });
  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP and complete pickup (Receiver)
// @route   POST /api/requests/:id/verify
// @access  Private (Receiver only)
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('food', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if receiver owns this request
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request not accepted yet' });
    }

    // Check if OTP exists
    if (!request.otp) {
      console.log(`No OTP found for request ${request._id}`);
      return res.status(400).json({ message: 'No OTP generated for this request. Please contact the donor to generate OTP.' });
    }

    // Check if OTP matches
    if (request.otp !== otp) {
      console.log(`Invalid OTP. Expected: ${request.otp}, Received: ${otp}`);
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check if OTP is expired
    if (isOTPExpired(request.otpExpiry)) {
      console.log(`OTP expired for request ${request._id}`);
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP from donor.' });
    }

    // Update request status
    request.status = 'completed';
    request.completedAt = new Date();
    request.otp = null;
    request.otpExpiry = null;
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food, {
      status: 'completed'
    });

    // Update receiver stats
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { totalClaims: 1 }
    });

    res.json({
      success: true,
      message: 'Pickup completed successfully!',
      request
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Resend OTP (Donor)
// @route   POST /api/requests/:id/resend-otp
// @access  Private (Donor only)
const resendOTP = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if donor owns this request
    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted first' });
    }

    // Generate new OTP
    const otp = generateOTPCode();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);

    request.otp = otp;
    request.otpExpiry = otpExpiry;
    await request.save();

    console.log(`OTP resent for request ${request._id}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      otp: otp,
      expiry: otpExpiry
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Complete request (Receiver marks as delivered)
// @route   PUT /api/requests/:id/complete
// @access  Private (Receiver only)
const completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if receiver owns this request
    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request not accepted yet' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Request completed successfully',
      request
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDonorRequests,
  getReceiverClaims,
  acceptRequest,
  rejectRequest,
  generateOTP,
  verifyOTP,
  resendOTP,
  completeRequest
};