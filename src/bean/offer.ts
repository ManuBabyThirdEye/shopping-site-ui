export interface MainOffer {
    image : string;
    id : string;
    order : number;
    hide : boolean;
}

export interface HomeItems {
    id : string;
    heading : string;
    order : number;
    items : Array<HomeSubItem>
    edit : boolean;
    editedHeading : string;
    editedOrder : number;
    hide : boolean;
}

export interface HomeSubItem{
    order : number;
    image : string;
    id : string;
    hide : boolean;
}

