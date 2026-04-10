type UserInfoStore_props = {
    id_User: number,
    name: string,
    rolls: number[],
    rollsName: srtring[],
    set_id_User: (id_User: number) => void,
    set_name: (name: string) => void,
    set_rolls: (rolls: number[]) => void,
    set_rollsName: (rollsName: string[]) => void
}

export {
    UserInfoStore_props
}