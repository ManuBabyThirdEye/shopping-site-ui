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
}
export interface CartProduct{
    quantity : number;
    size : string;
    cartId : string;
    product : Product;
    productRef : DocumentReference;
    delivertDate : string;
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
}

export enum OrderClasification{
    RETURN,CANCELLED,PLACED
}

export enum AllSize{
    S,M,L,XL,XXL,XXXL
}