"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.getMyAddresses = void 0;
const Address_1 = require("../models/Address");
// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getMyAddresses = async (req, res) => {
    try {
        const addresses = await Address_1.Address.find({ user: req.user?.id });
        res.status(200).json(addresses);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getMyAddresses = getMyAddresses;
// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
const addAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        // If it's the first address, make it default
        const count = await Address_1.Address.countDocuments({ user: userId });
        const isDefault = req.body.isDefault || count === 0;
        if (isDefault) {
            // Remove default from other addresses
            await Address_1.Address.updateMany({ user: userId }, { isDefault: false });
        }
        const address = await Address_1.Address.create({
            ...req.body,
            user: userId,
            isDefault
        });
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.addAddress = addAddress;
// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id;
        const address = await Address_1.Address.findById(addressId);
        if (!address) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }
        if (address.user.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized to update this address' });
            return;
        }
        if (req.body.isDefault) {
            await Address_1.Address.updateMany({ user: userId }, { isDefault: false });
        }
        const updatedAddress = await Address_1.Address.findByIdAndUpdate(addressId, { ...req.body }, { new: true, runValidators: true });
        res.status(200).json(updatedAddress);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAddress = updateAddress;
// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user?.id;
        const addressId = req.params.id;
        const address = await Address_1.Address.findById(addressId);
        if (!address) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }
        if (address.user.toString() !== userId) {
            res.status(403).json({ message: 'Not authorized to delete this address' });
            return;
        }
        await Address_1.Address.findByIdAndDelete(addressId);
        res.status(200).json({ message: 'Address removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAddress = deleteAddress;
