import { action, computed, makeObservable, observable } from "mobx";
import { UserBase } from "../models/user";
import React from "react";


export class UserStore {
    constructor() {
        makeObservable(this);
    }

    @observable user: UserBase | null = null;
    @action setUser = (v: UserBase): void => {
        this.user = v;
    }
    @action getUser = (): UserBase | null => {
        return this.user
    }
    @computed get isLogined(): boolean {
        return this.user !== null
    }
}


const globalUserStore = new UserStore();
export const UerStoreContext = React.createContext<UserStore>(globalUserStore)
