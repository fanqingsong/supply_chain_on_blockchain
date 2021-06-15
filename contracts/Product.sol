pragma solidity >=0.4.25 <0.6.0;

/********************************************** Product ******************************************/
/// @title Product
/// @notice
/// @dev
contract Product {

    /// @notice
    address Owner;

    enum ProductStatus {
        atcreator,
        received
    }

    // batch des
    string description;

    /// @notice
    address[] rawmatriales;
    
    /// @notice
    uint quantity;
    
    /// @notice
    address manufacturer;
    
    /// @notice
    address receiver;

    /// @notice
    ProductStatus status;

    /// @notice
    /// @dev Create new Product Batch by Manufacturer
    /// @param Manu Manufacturer Ethereum Network Address
    /// @param Des Description of Product Batch
    /// @param Quant Number of units
    /// @param Rcvr Receiver Ethereum Network Address
    constructor(
        address Manu,
        string memory Des,
        uint Quant,
        address Rcvr
    ) public {
        Owner = Manu;

        manufacturer = Manu;
        description = Des;
        quantity = Quant;
        receiver = Rcvr;
    }

    function addMaterial(address packageId) public {
        rawmatriales.push(packageId);
    }

    /// @notice
    /// @dev Get Product Batch basic Details
    /// @return Product Batch Details
    function getProductInfo () public view returns(
        address Manu,
        string memory Des,
        address[] memory RM,
        uint Quant,
        address Rcvr
    ) {
        return(
            manufacturer,
            description,
            rawmatriales,
            quantity,
            receiver
        );
    }

    /// @notice
    /// @dev Get Product Batch Transaction Status
    /// @return Product Transaction Status
    function getBatchIDStatus() public view returns(
        uint
    ) {
        return uint(status);
    }

    /// @notice
    /// @dev Received Product Batch by Customer
    /// @param Rcvr customer
    function receivedPackage(
        address Rcvr
    ) public
    {
        require(
            Rcvr == receiver,
            "Only Associate receiver can call this function"
        );

        require(
            status == ProductStatus(0),
            "Product not picked up yet"
        );

        status = ProductStatus(1);
    }
}
