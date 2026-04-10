import { createClient } from '@/lib/supabase/client';
import { InstituteStore } from '@/Stores/InstituteStore';


export const getInfoInstitute = async (institute_id: string) => {

    const setInstitute = InstituteStore.getState().setInstitute
    const supabase = createClient();

    const { data, error } = await supabase
        .from("institute")
        .select("*")
        .eq("id", institute_id)
        .maybeSingle();

    if (error) { console.error(error); return }

    setInstitute(data)
};


