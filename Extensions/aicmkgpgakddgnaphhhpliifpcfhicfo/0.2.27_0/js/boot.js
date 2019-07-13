/**
 * @description the following methods are called once background page is loaded on each boot
 */

// long-lived connection to the popupchannel (as popup is opened) notifies when popup can start listening
initializeConnectionWithPopup();

// once the chrome is opened, this method will set the secretKey global which will be used for encryption/decryption
initializeSecretKey();

// initially loads the values as a global variable and it also adds to cookie change addListener if enabled == true
configureCookieSyncOptionsFromLocalStorage();

// initially loads the domain list from chrome's local storage
loadDomainListFromLocalStorage();
