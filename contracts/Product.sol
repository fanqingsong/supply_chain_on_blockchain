pragma solidity >=0.4.25 <0.6.0;

// We import this library to be able to use console.log
import "@nomiclabs/buidler/console.sol";

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
    /// @param RM rawMaterials arrary for packageIds
    /// @param Quant Number of units
    /// @param Rcvr Receiver Ethereum Network Address
    constructor(
        address Manu,
        string memory Des,
        address[] memory RM,
        uint Quant,
        address Rcvr
    ) public {
        // We can print messages and values using console.log
        console.log(
            "call product (%s) by %s",
            Des,
            msg.sender
        );

        Owner = Manu;

        manufacturer = Manu;
        description = Des;

        console.log(
            "call raw material len (%s) by %s",
            RM.length,
            msg.sender
        );

        for(uint i=0; i<RM.length; i++) {
            console.log(
                "call raw material (%s) by %s",
                RM[i],
                msg.sender
            );
        }

        rawmatriales = new address[](RM.length);

        for(uint i=0; i<RM.length; i++) {
            rawmatriales[i] = RM[i];
        }

        // We can print messages and values using console.log
        console.log(
            "call after new product (%s) by %s",
            Des,
            msg.sender
        );

        quantity = Quant;
        receiver = Rcvr;
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
