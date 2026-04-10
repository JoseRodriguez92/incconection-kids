import { createClient } from "@/lib/supabase/client";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import { SupabaseClient } from "@supabase/supabase-js";
import { Dispatch, SetStateAction } from "react";
import { getInfoInstitute } from "./getInfoInstitute";

let listRoles: string[] = [];
let idInstitute: string;

const mapItemsRoles = async (
  supabase: SupabaseClient<any, "public", "public", any, any>,
  idRol: string
) => {
  /** Consultamos los roles que tiene ese usuario por su ID  */
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", idRol);

  if (error) {
    console.error(error);
    return;
  }

  /** Se los asignamos  */
  data ? listRoles.push(data[0].name) : null;
  data && (idInstitute = data[0].institute_id);
};

export const getUserRoles = async (
  setSignIn: Dispatch<SetStateAction<"OK" | "loading" | "false">>
) => {
  /** Función para agregar los roles al usuario */
  const setUserRoles = UserInfoStore.getState().setRoles;

  /** Tomamos la información del usuarioe iniciamos la base de datos */
  const userInfo = UserInfoStore.getState().user;
  const supabase = createClient();

  /** Normalizamos la lsita de roles */
  listRoles = [];

  /**  consultamos los roles que tiene el usuarios */
  const { data, error } = await supabase
    .from("profiles_roles")
    .select("*")
    .eq("user_id", userInfo?.id);

  if (error) throw error;

  /** El usuario tiene uno o más de un rol , los asignamos */
  data.map((item) => {
    mapItemsRoles(supabase, item.role_id);
  });

  setTimeout(async () => {
    await getInfoInstitute(idInstitute);
    setUserRoles(listRoles);
  }, 2000);
};
