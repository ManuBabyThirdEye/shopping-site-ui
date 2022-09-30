import { DocumentReference } from "@angular/fire/firestore";

export interface SubCategory {
    name:string;
    id:string;
    order : number;
}

export interface Category {
    name:string;
    id:string;
    subCategories:Array<SubCategory>;
    page:number;
    order:number;
    showSubCategories : boolean;
    selected : boolean;
}

export interface MainCategory {
    id : string;
    name:string;
    pageCount:number;
    categories:Array<Category>;
    showCategories : boolean;
    selected : boolean;
    order : number

}

export interface CategoryMap{
    mainCategoryName:string;
    categoryName: string;
    categoryId: string;
    subCategoryName: string;
    subCategoryId: string;
}

export interface FilterMain {
    filters : Array<Filter>;
}

export interface Filter {
    name : string;
    order : number;
    prefix : string;
    suffice : string;
    type : string;
    items : Array<string>;
}

export interface Product{
    id : string;
    name : string;
    details : string;
    images : Array<string>;
    discount : number;
    discountPrice : number;
    availableSizes : Array<Size>;
    reviews : Array<Review>;
    rating : number;
    isWishList : boolean;
    productDeliveryDelay: number;
    availableSizeString : string;
    category: Array<string>;
    subProductList : Array<SubProduct>
}
export interface SubProduct{
    id : string;
    colorCode : string;
    discount : number;
    discountPrice : number;
    moreDetails : Map<string,string>;
    quantity : number;
    selected : boolean;
    order : number;
}
export interface WishItem{
    id : string;
    image : string;
    discount : number;
    discountPrice : number;
    availableSizes : Array<string>;
    isWishList : boolean;
}
export interface Size{
    size : string;
    count : number;
}

export interface Review{
    rating : number;
    comment : string;
    reviewerName : string;
}

export interface PinCode{
    pincode : string;
    available : boolean;
    codAvailable : boolean;
    returnAvailable : boolean;
    pinCodeDeliveryDelay : number;
    minOrderAmount : number;
    convenienceFee : number;
    district : string;
    state : string;

}
export interface Address{
    id : string;
    name : string;
    mobileNumber : string;
    address : string;
    town : string;
    district : string;
    state : string;
    pinCode : string;
    selected : boolean;
}
/*export interface Order{
    productList : Array<Product>;
    actualTotalAmount : number;
    discountedTotalAmount : number;
    deliveryAddress : Address;
    expectedDeliveryDate:number;
    currentOrderStatus: String;
    orderStatusList : Array<OrderStatus>
}*/

export interface OrderStatus{
    orderStatus : string;
    date:string;
}
export interface User{
    name : string;
    mobileNumber : string;
    admin : boolean;
    superAdmin : boolean;
}
export interface CartProduct{
    quantity : number;
    size : string;
    cartId : string;
    product : Product;
    productRef : DocumentReference;
    delivertDate : string;
    subProduct : SubProduct;
}

export interface Order{
    id:string;
    cartProducts : Array<CartProduct>;
    mobileNumber : string;
    address : Address;
    total : number;
    totalMRP : number;
    convenienceFee : number;
    currentOrderStatus: string;
    orderStatusList : Array<OrderStatus>
    includeConvenienceFee : boolean;
    placedDate : string;
    paymentMode :PaymentMode;
    paymentDetails : PaymentDetails;
    inPersonDiscount : number;
    hide : boolean;
    parentOrderId : string;
    parentOrderDate : string;

}

export interface PaymentDetails{
    apiVersion : number;
    apiVersionMinor : number;
    paymentMethodData : PaymentMethodData;
}

export interface PaymentMethodData{
    description : string;
    info : CardInfo;
    tokenizationData : TokenizationData;
}

export interface TokenizationData{
    token : string;
    type : string;
}

export interface CardInfo{
    cardDetails : string;
    cardNetwork : string;
}

export enum OrderClasification{
    RETURN,CANCELLED,PLACED
}
export enum PaymentMode{
    GOOGLE_PAY,COD,CARD,SHOP_CASH
}

export enum AllSize{
    S,M,L,XL,XXL,XXXL,FS
}

export interface GogolePaymentRequest{
    apiVersion : number;
    apiVersionMinor : number;
    allowedPaymentMethods : Array<AllowedPaymentMethod>;
    merchantInfo : MerchantInfo;
    transactionInfo : TransactionInfo;
    callbackIntents: Array<string>;

}

export interface TransactionInfo{
    totalPriceStatus : string;
    totalPriceLabel : string;
    totalPrice : string;
    currencyCode : string;
    countryCode : string;
}

export interface MerchantInfo{
    merchantId : string;
    merchantName : string;
}

export interface AllowedPaymentMethod{
    type : string;
    parameters : Parameters;
    tokenizationSpecification : TokenizationSpecification;
}

export interface TokenizationSpecification{
    type : string;
    parameters : TokenizationParameters;
}

export interface TokenizationParameters{
    gateway : string;
    gatewayMerchantId : string;
}

export interface Parameters{
    allowedAuthMethods : Array<string>;
    allowedCardNetworks : Array<string>;
}

export enum KEY_CODE {
    ENTER = 13,
    ZERO = 48,
    NINE = 57,
    A = 65,
    Z = 90,
    _ = 189,
    BACK = 8
}

export interface Revenue{
    amount : number;
    count : number;
}