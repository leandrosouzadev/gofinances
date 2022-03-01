import React, {
    createContext,
    ReactNode,
    useContext,
    useState,
    useEffect
} from 'react';

import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication';

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
    signInWithApple(): Promise<void>;
    signOut(): Promise<void>;
    userStorageLoading: boolean;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>({} as User);
    const [userStorageLoading, setUserStorageLoading] = useState(true);

    const userStorageKey = '@gofinances:user';

    async function signInWithGoogle() {
        try {
            const result = await Google.logInAsync({
                iosClientId: '355972636151-2vf27cfon3verni1dd6la8h3g2rgch3i.apps.googleusercontent.com',
                androidClientId: '355972636151-5oftidf6fnsbujqsb24rju2kmts6essn.apps.googleusercontent.com',
                scopes: ['profile', 'email']
            });

            if (result.type === 'success') {
                const userLogged = {
                    id: String(result.user.id),
                    email: result.user.email!,
                    name: result.user.name!,
                    photo: result.user.photoUrl!
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
            }

        } catch (error) {
            throw new Error(String(error));
        }
    }

    async function signInWithApple() {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ]
            });

            if (credential) {
                const name = credential.fullName!.givenName!;
                const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;

                const userLogged = {
                    id: String(credential.user),
                    email: credential.email!,
                    name: name,
                    photo: photo
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
            }

        } catch (error) {
            throw new Error(String(error));
        }
    }

    async function signOut() {
        setUser({} as User);
        await AsyncStorage.removeItem(userStorageKey);
    }

    useEffect(() => {
        async function loadUserStorageDate() {
            const userStoraged = await AsyncStorage.getItem(userStorageKey);

            if(userStoraged) {
                const userLogged = JSON.parse(userStoraged) as User;
                setUser(userLogged);
            }

            setUserStorageLoading(false);            
        }

        loadUserStorageDate();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signInWithApple,
            signOut,
            userStorageLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const contex = useContext(AuthContext);

    return contex;
}

export { AuthProvider, useAuth };