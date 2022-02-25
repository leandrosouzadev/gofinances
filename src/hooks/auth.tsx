import React, {
    createContext,
    ReactNode,
    useContext,
    useState
} from 'react';

import * as Google from 'expo-google-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthProviderProps {
    children: ReactNode;
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps ) {
    const [user, setUser] = useState<User>({} as User);

    async function signInWithGoogle() {
        try {
            const result = await Google.logInAsync({
                iosClientId: '355972636151-2vf27cfon3verni1dd6la8h3g2rgch3i.apps.googleusercontent.com',
                androidClientId: '355972636151-5oftidf6fnsbujqsb24rju2kmts6essn.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });

            if(result.type === 'success') {
                const userLogged = {
                    id: String(result.user.id),
                    email: result.user.email!,
                    name: result.user.name!,
                    photo: result.user.photoUrl!
                };

                setUser(userLogged);
                await AsyncStorage.setItem('@gofinances:user', JSON.stringify(userLogged));
            }            

        } catch(error) {
            throw new Error(String(error));
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            signInWithGoogle
            }}>
          { children }
        </AuthContext.Provider>        
    );
}

function useAuth() {
    const contex = useContext(AuthContext);
    
    return contex;
}

export { AuthProvider, useAuth };