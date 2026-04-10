'use client'

import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MailX, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getUserAuth } from './utils/getUserAuth';
import { getUserRoles } from './utils/getUserRoles';
import { UserInfoStore, getStoredRoleCookie } from '@/Stores/UserInfoStore';

export default function CallbackPage() {

    /** Declaro states de estado de ingreso */
    const [signIn, setSignIn] = useState<'OK' | 'loading' | 'false'>('loading');
    const { roles } = UserInfoStore()

    /** Redireccionamos según el rol activo guardado o por prioridad. */
    useEffect(() => {
        if (roles.length === 0) return;
        const rolePriority = [
            "super-admin", "tienda", "padre-familia",
            "psicologia", "profesor", "estudiante", "ruta",
        ];
        const savedRole = getStoredRoleCookie();
        const targetRole =
            savedRole && roles.includes(savedRole)
                ? savedRole
                : rolePriority.find((r) => roles.includes(r)) ?? roles[0];
        UserInfoStore.getState().setCurrentRole(targetRole);
        location.href = `${location.origin}/usuario/${targetRole}`;
    }, [roles]);

    /** 
        * Voy a obtener el usuario que se intentó logear - la data se guarda en las cookies - lo que hace es recuperar esos valores y
        * hacer la verificación
    */
    useEffect(() => {

        const getUser = async () => {
            try {
                /** Aqui por el signIn dice cargando ... autenticamos al usuario / valido en nuestra plataforma /  */
                await getUserAuth(setSignIn);
                /** Aqui por el signIn redirecciona ... asignando roles por usuario */
                await getUserRoles(setSignIn);
            } catch (error) {
                console.error('Error in getUser:', error);
            }
        }
        getUser();

    }, []);    

    return <div>
        {
            signIn == 'false' &&
            <div className="w-full min-h-[60vh] flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5" />
                            No pudimos autenticarte
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {/* {email ? (
                                <>El correo <span className="font-medium">{email}</span> no está registrado en nuestra plataforma.</>
                            ) : (
                                <>El correo proporcionado no está registrado en nuestra plataforma.</>
                            )} */}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <MailX className="h-4 w-4" />
                            <AlertTitle>Acceso denegado</AlertTitle>
                            <AlertDescription>
                                Si crees que es un error, intenta con otro correo o contáctanos
                                para darte acceso.
                            </AlertDescription>
                        </Alert>

                        <div className="flex flex-col gap-[10px]">
                            <Button className="w-full" onClick={() => window.location.href = `${window.location.origin}`} >
                                Reintentar
                            </Button>
                            <Button variant="outline" className="w-full" >
                                Soporte
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        }
        {
            signIn == 'loading' && <div>Cargando</div>
        }
    </div>

};