pragma solidity >=0.4.25 <0.6.0;

/********************************************** RawMatrials ******************************************/
/// @title RawMatrials
/// @notice
/// @dev Create new instance of RawMatrials package
contract RawMatrials {
    /// @notice
    address Owner;

    enum packageStatus { atcreator, received}

    /// @notice
    address productid;

    /// @notice
    bytes32 description;

    /// @notice
    bytes32 factory_name;

    /// @notice
    bytes32 location;

    /// @notice
    uint quantity;

    /// @notice
    address manufacturer;

    /// @notice
    address supplier;

    /// @notice
    packageStatus status;

    /// @notice
    bytes32 packageReceiverDescription;

    /// @notice
    /// @dev Intiate New Package of RawMatrials by Supplier
    /// @param Splr Supplier Ethereum Network Address
    /// @param Des Description of RawMatrials
    /// @param FN Factory Name
    /// @param Loc Factory Location
    /// @param Quant Number of units in a package
    /// @param Rcvr Manufacturer Ethereum Network Address
    constructor (
        address Splr,
        bytes32 Des,
        bytes32 FN,
        bytes32 Loc,
        uint Quant,
        address Rcvr
    ) public {
        Owner = Splr;
        productid = address(this);
        description = Des;
        factory_name = FN;
        location = Loc;
        quantity = Quant;
        manufacturer = Rcvr;
        supplier = Splr;
        status = packageStatus(0);
    }

    /// @notice
    /// @dev Get RawMatrials Package Details
    /// @return Package Details
    function getSuppliedRawMatrials () public view returns(
        bytes32 Des,
        bytes32 FN,
        bytes32 Loc,
        uint Quant,
        address Rcvr,
        address Splr
    ) {
        return(
            description,
            factory_name,
            location,
            quantity,
            manufacturer,
            supplier
        );
    }

    /// @notice
    /// @dev Get Package Transaction Status
    /// @return Package Status
    function getRawMatrialsStatus() public view returns(
        uint
    ) {
        return uint(status);
    }

    /// @notice
    /// @dev Received Package Status Update By Associated Manufacturer
    /// @param manu Manufacturer Ethereum Network Address
    function receivedPackage(
        address manu
    ) public {
        require(
            manu == manufacturer,
            "Only Associate Manufacturer can call this function"
        );

        require(
            status == packageStatus(0),
            "Product not picked up yet"
        );

        status = packageStatus(1);
    }
}
