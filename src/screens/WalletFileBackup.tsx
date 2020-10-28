import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { BlueButton, PasswordInput, Loader } from 'components';
import { createAccounts } from 'utils/db'
import { backup, BackupType, GoogleDiskFolder } from 'utils/backup'
import * as Auth from 'storage/Auth'
import * as Dialog from 'storage/Dialog'

const minPasswordLength = 6

export const WalletFileBackup = ({ route }: { route: any }) => {
    const authContext = useContext(Auth.Context)
    const dialogContext = useContext(Dialog.Context)

    const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState<string>("")
    const [isLoading, setLoading] = useState<boolean>(false)
    const [isBackup, setBackup] = useState<boolean>(false)

    const seed: string = route.params.seed.join(" ")
    const type: BackupType = route.params.type

    const startBackup = async () => {
        setLoading(true)
        setBackup(true)
    }

    const signIn = async () => {
        await dialogContext.dispatch(Dialog.close())
        authContext.dispatch(Auth.signIn())
    }

    useEffect(() => {
        if (!isBackup)
            return

        backup(seed, password, type).then(async (info) => {
            if (!info.isSuccess) {
                setLoading(false)
                return
            }

            await createAccounts(seed)


            switch (type) {
                case BackupType.File:
                    dialogContext.dispatch(
                        Dialog.open("Success save file", `Save your wallet in a safe place. File: ${info.fileName}`, signIn)
                    )
                    break
                case BackupType.GoogleDisk:
                    dialogContext.dispatch(
                        Dialog.open(
                            "Success google disk",
                            `Save your wallet in a safe place. Folder: ${GoogleDiskFolder}. File: ${info.fileName}`,
                            signIn
                        )
                    )
                    break
            }
        })
    }, [isBackup])

    const renderButtonOrError = () => {
        if (confirmPassword == "" || password == "") {
            return null
        } else if (password.length < minPasswordLength && password != "" && confirmPassword != "")
            return <Text style={styles.error}>Minimum password length is 6 characters</Text>
        else if (password != confirmPassword)
            return <Text style={styles.error}>Password do not match</Text>

        return (
            <View style={{ width: '80%', position: 'absolute', bottom: 40 }}>
                <BlueButton text={"Encrypt"} height={50} onPress={startBackup} />
            </View>
        )
    }

    if (isLoading) {
        return <Loader />
    }

    return (
        <View style={{ flexDirection: "column", flex: 1, alignItems: "center", marginTop: 40 }}>
            <Text style={styles.title}>Wallet encryption</Text>
            <Text style={styles.description}>Enter the password to encrypt your wallet. Do not lose your password otherwise you will not be able to restore access.</Text>

            <View style={styles.newPassword}>
                <PasswordInput
                    onChangeText={(value: string) => setPassword(value)}
                    placeholder={"Password"}
                    defaultValue={password}
                />
            </View>
            <View style={styles.confirmPassword}>
                <PasswordInput
                    onChangeText={(value: string) => setConfirmPassword(value)}
                    placeholder={"Confirm password"}
                    defaultValue={confirmPassword}
                />
            </View>
            {renderButtonOrError()}
        </View>
    );
}


const styles = StyleSheet.create({
    title: {
        marginTop: 80,
        fontSize: 25,
        fontFamily: "Roboto-Regular",
        color: "#2AB2E2",
    },
    description: {
        width: '90%',
        marginTop: 40,
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        color: "#888888",
    },
    newPassword: {
        marginTop: 30,
        width: "90%"
    },
    confirmPassword: {
        marginTop: 20,
        width: "90%"
    },
    error: {
        marginTop: 20,
        color: "red",
        fontFamily: "Roboto-Regular",
        fontSize: 15
    }
});