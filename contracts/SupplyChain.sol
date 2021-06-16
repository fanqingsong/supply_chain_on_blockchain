pragma solidity >=0.4.25 <0.6.0;

import './RawMatrials.sol';
import './Product.sol';

// We import this library to be able to use console.log
import "@nomiclabs/buidler/console.sol";


/// @title Blockchain : Pharmaceutical SupplyChain
/// @author Kamal Kishor Mehra
contract SupplyChain {

    /// @notice
    address public Owner;

    /// @notice
    /// @dev Initiate SupplyChain Contract
    constructor () public {
        Owner = msg.sender;

        // add owner as the admin user
        registerUser(Owner, "Admin", "Nanking", uint(roles.admin));
    }

    /// @dev Validate Owner
    modifier onlyOwner() {
        require(
            msg.sender == Owner,
            "Only owner can call this function."
        );
        _;
    }

/********************************************** User Section **********************************************/
    enum roles {
        norole, // 0
        admin, // 1
        supplier, //2
        manufacturer, //3
        customer //4
    }

    struct UserInfo {
        string name;
        string location;
        address ethAddress;
        roles role;
        bool disabled;
    }

    /// @notice
    mapping(address => UserInfo) UsersDetails;
    
    /// @notice
    address[] users;

    /// @notice
    /// @dev Get User Information/ Profile
    /// @param User User Ethereum Network Address
    /// @return User Details
    function getUserInfo(address User) public view returns(
        string memory name,
        string memory location,
        address ethAddress,
        roles role,
        bool disabled
        ) {
        return (
            UsersDetails[User].name,
            UsersDetails[User].location,
            UsersDetails[User].ethAddress,
            UsersDetails[User].role,
            UsersDetails[User].disabled);
    }

    /// @notice
    /// @dev Get Number of registered Users
    /// @return Number of registered Users
    function getUsersCount() public view returns(uint count){
        return users.length;
    }

    /// @notice
    /// @dev Get User by Index value of stored data
    /// @param index Indexed Number
    /// @return User Details
    function getUserbyIndex(uint index) public view returns(
        string memory name,
        string memory location,
        address ethAddress,
        roles role,
        bool disabled
        ) {
        return getUserInfo(users[index]);
    }

/********************************************** Owner Section *********************************************/
    event UserRegister(address indexed EthAddress, string Name);
    event UserDisabledToggle(address indexed EthAddress, string Name);

    /// @notice
    /// @dev Register New user by Owner
    /// @param EthAddress Ethereum Network Address of User
    /// @param Name User name
    /// @param Location User Location
    /// @param Role User Role
    function registerUser(
        address EthAddress,
        string memory Name,
        string memory Location,
        uint Role
        ) public
        onlyOwner
    {
        require(UsersDetails[EthAddress].role == roles.norole, "User Already registered");

        UsersDetails[EthAddress].name = Name;
        UsersDetails[EthAddress].location = Location;
        UsersDetails[EthAddress].ethAddress = EthAddress;
        UsersDetails[EthAddress].role = roles(Role);
        UsersDetails[EthAddress].disabled = false;

        users.push(EthAddress);

        emit UserRegister(EthAddress, Name);
    }

    /// @notice
    /// @dev disable users role
    /// @param userAddress User Ethereum Network Address
    function toggleUserDisabled(address userAddress) public onlyOwner {
        require(UsersDetails[userAddress].role != roles.norole, "User not registered");

        UsersDetails[userAddress].disabled = !UsersDetails[userAddress].disabled;

        emit UserDisabledToggle(userAddress, UsersDetails[userAddress].name);
    }

/********************************************** Supplier Section ******************************************/
    /// @notice
    mapping(address => address[]) supplierRawProductInfo;

    event RawSupplyInit(
        address indexed ProductID,
        address indexed Supplier,
        address indexed Receiver
    );

    /// @notice
    /// @dev Create new raw package by Supplier
    /// @param Rcvr Manufacturer Ethereum Network Address
    function createRawPackage(
        bytes32 Des,
        bytes32 FN,
        bytes32 Loc,
        uint Quant,
        address Rcvr
        ) public {
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );

        RawMatrials rawData = new RawMatrials(
            msg.sender,
            Des,
            FN,
            Loc,
            Quant,
            Rcvr
            );

        supplierRawProductInfo[msg.sender].push(address(rawData));

        emit RawSupplyInit(address(rawData), msg.sender, Rcvr);
    }

    /// @notice
    /// @dev  Get Count of created package by supplier(caller)
    /// @return Number of packages
    function getPackagesCountS() public view returns (uint count){
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );

        return supplierRawProductInfo[msg.sender].length;
    }

    function getPackagesCountS_SID(address supplierId) public view returns (uint count){
        return supplierRawProductInfo[supplierId].length;
    }

    /// @notice
    /// @dev Get PackageID by Indexed value of stored data
    /// @param index Indexed Value
    /// @return PackageID
    function getPackageIdByIndexS(uint index) public view returns(address packageID) {
        require(
            UsersDetails[msg.sender].role == roles.supplier,
            "Only Supplier Can call this function "
        );
        
        return supplierRawProductInfo[msg.sender][index];
    }

    function getPackageIdByIndexS_SID(address supplierId, uint index) public view returns(address packageID) {
        return supplierRawProductInfo[supplierId][index];
    }

    function getPackageInfoByIdS(address packageId) public view returns(
        bytes32 Des,
        bytes32 FN,
        bytes32 Loc,
        uint Quant,
        address Rcvr,
        address Splr
    ){
        return RawMatrials(packageId).getSuppliedRawMatrials();
    }

    function getPackageStatusByIdS(address packageId) public view returns(
        uint
    ) {
        return RawMatrials(packageId).getRawMatrialsStatus();
    }

/********************************************** Manufacturer Section ******************************************/
    /// @notice
    mapping(address => address[]) RawPackagesAtManufacturer;

    /// @notice
    /// @dev Update Package / Product batch recieved status by ethier Manufacturer or Distributer
    /// @param pid  PackageID or ProductID
    function  rawPackageReceived(
        address pid
    ) public {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );

        RawMatrials(pid).receivedPackage(msg.sender);

        RawPackagesAtManufacturer[msg.sender].push(pid);
    }

    /// @notice
    /// @dev Get Package Count at Manufacturer
    /// @return Number of Packages at Manufacturer
    function getPackagesCountM() public view returns(uint count){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );

        return RawPackagesAtManufacturer[msg.sender].length;
    }

    /// @notice
    /// @dev Get PackageID by Indexed value of stored data
    /// @param index Indexed Value
    /// @return PackageID
    function getPackageIDByIndexM(uint index) public view returns(address PackageID){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );

        return RawPackagesAtManufacturer[msg.sender][index];
    }


    /// @notice
    mapping(address => address[]) ManufactureredProductBatches;

    event ProductNewBatch(
        address indexed BatchId,
        address indexed Manufacturer,
        address indexed Receiver
    );

    /// @notice
    /// @dev Create Product Batch
    /// @param Des Description of Product batch
    /// @param RM rawMaterials arrary for packageIds
    /// @param Quant Number of Units
    /// @param Rcvr Receiver Ethereum Network Address
    function manufactureProduct(
        string memory Des,
        address[] memory RM,
        uint Quant,
        address Rcvr
    ) public {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only manufacturer can call this function"
        );

        // We can print messages and values using console.log
        console.log(
            "call manufactureProduct (%s) by %s",
            Des,
            msg.sender
        );

        console.log(
            "raw material len (%s) by %s",
            RM.length,
            msg.sender
        );

        for(uint i=0; i<RM.length; i++) {
            console.log(
                "raw material (%s) by %s",
                RM[i],
                msg.sender
            );
        }

        Product m = new Product(
            msg.sender,
            Des,
            RM,
            Quant,
            Rcvr
        );

        // We can print messages and values using console.log
        console.log(
            "after new product (%s) by %s",
            Des,
            msg.sender
        );

        ManufactureredProductBatches[msg.sender].push(address(m));

        emit ProductNewBatch(address(m), msg.sender, Rcvr);

        // We can print messages and values using console.log
        console.log(
            "over product (%s) by %s",
            Des,
            msg.sender
        );
    }

    /// @notice
    /// @dev Get Product Batch Count
    /// @return Number of Batches
    function getBatchesCountM() public view returns (uint count){
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only Manufacturer Can call this function."
        );

        return ManufactureredProductBatches[msg.sender].length;
    }

    function getBatchesCountM_SID(address manufacturer) public view returns (uint count){
        return ManufactureredProductBatches[manufacturer].length;
    }

    /// @notice
    /// @dev Get Product BatchID by indexed value of stored data
    /// @param index Indexed Number
    /// @return Product BatchID
    function getBatchIdByIndexM(uint index) public view returns(address BathID) {
        require(
            UsersDetails[msg.sender].role == roles.manufacturer,
            "Only Manufacturer Can call this function."
        );

        return ManufactureredProductBatches[msg.sender][index];
    }

    function getBatchIdByIndexM_SID(address manufacturer, uint index) public view returns(address BathID) {
        return ManufactureredProductBatches[manufacturer][index];
    }

    function getProductInfoById(address batchId) public view returns(
        address Manu,
        string memory Des,
        address[] memory RM,
        uint Quant,
        address Rcvr
    ){
        return Product(batchId).getProductInfo();
    }

    function getProductStatusById(address batchId) public view returns(
        uint
    ) {
        return Product(batchId).getBatchIDStatus();
    }

/********************************************** Customer Section ******************************************/
    /// @notice
    mapping(address => address[]) ProductsAtCustomer;

    function  productBatchReceived(
        address bid
    ) public {
        require(
            UsersDetails[msg.sender].role == roles.customer,
            "Only customer can call this function"
        );

        Product(bid).receivedPackage(msg.sender);

        ProductsAtCustomer[msg.sender].push(bid);
    }
}
