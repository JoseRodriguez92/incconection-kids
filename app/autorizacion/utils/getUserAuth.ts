

import { createClient } from '@/lib/supabase/client';
import { UserInfoStore } from '@/Stores/UserInfoStore';
import { Dispatch, SetStateAction } from 'react';

export const getUserAuth = async (
    setSignIn: Dispatch<SetStateAction<"OK" | "loading" | "false">>
) => {

    const supabase = createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    /** Si hay un error retornamos */
    if (error) {
        setSignIn('false');
        console.log(error);
        return;
    };


    /** Si no, setemos al usuario y lo redirigumos */
    UserInfoStore.getState().setUser(user)
    setSignIn('OK');
}
