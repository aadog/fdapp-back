import React, {useEffect, useState} from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {Button, Card, Modal} from "@ant-design/react-native";
import {Alert, StyleSheet, Text, View} from "react-native";
import {rootShell, rootShellSlice, userShell} from "react-native-shell";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from 'react-native-fs'

const fridaFileName = "fsrv.SQVHKE89gQ"
const fridaVersion="15.1.22-android-arm64"
const Index = ({navigation}: NativeStackScreenProps<any>) => {
    const [fridaDirState, setFridaDirState] = useState('/data/local/tmp');
    const [isRootState, setIsRootState] = useState(false)
    const [isRunFrida, setIsRunFrida] = useState(false);
    const [fridaPortState, setFridaPortState] = useState<number>(27042);
    useEffect(() => {
        (async () => {
            setFridaDirState(RNFS.TemporaryDirectoryPath)
            navigation.setOptions({title:`frida version ${fridaVersion}`})
            try {
                var pt = await AsyncStorage.getItem("@fridaPort")
                if (pt != null) {
                    setFridaPortState(Number(pt))
                }
                await AsyncStorage.setItem("test", "11")
                var lsR = await rootShellSlice("ls /")
                if (lsR.length > 0) {
                    setIsRootState(true)
                }
            } catch (e: any) {
                Alert.alert(e.toString())
            }
        })()
        var t = setInterval(async function () {
            try {
                await rootShellSlice(`pgrep ${fridaFileName}`)
                setIsRunFrida(true)
            } catch (e: any) {
                setIsRunFrida(false)
            }
        }, 1000)
        return () => {
            clearTimeout(t)
        }
    }, []);


    return (
        <View>
            <Card>
                <Card.Header title={"状态"}/>
                <Card.Body>
                    <View style={{flexDirection: 'row', paddingHorizontal: 10, paddingTop: 5, flexWrap: 'wrap'}}>
                        <View style={{flexDirection: 'row',}}>
                            <Text>root权限:</Text>
                            <Text>{isRootState && "已root" || "未root"}</Text>
                        </View>
                        <View style={{width: 20}}></View>
                        <View style={{flexDirection: 'row',}}>
                            <Text>frida状态:</Text>
                            <Text>{isRunFrida && "运行" || "停止"}</Text>
                        </View>
                        <View style={{width: 20}}></View>
                        <View style={{flexDirection: 'row',}}>
                            <Text>frida端口:</Text>
                            <Text>{fridaPortState}</Text>
                        </View>
                    </View>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header title={"按钮操作"}/>
                <Card.Body>
                    <View style={{...styles.item}}>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                disabled={isRunFrida}
                                onPress={
                                    async () => {
                                        try {
                                            await checkAndInstallFrida()
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            await rootShell(`setsid ${fridaDirState}/${fridaFileName} & > ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(true)
                                        } catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >启动</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                disabled={isRunFrida}
                                onPress={
                                    async () => {
                                        try {
                                            await checkAndInstallFrida()
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            await rootShell(`setsid ${fridaDirState}/${fridaFileName} -l 0.0.0.0:${fridaPortState} & > ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(true)
                                        } catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >启动网络</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                onPress={
                                    () => {
                                        Modal.prompt(
                                            '修改frida端口',
                                            '设置一个端口,范围在1-65535',
                                            async (sport: any) => {
                                                var port = Number(sport)
                                                if (port < 1 || port > 65535 || isNaN(port)) {
                                                    Alert.alert("发生错误,端口范围1-65535")
                                                    return
                                                }
                                                await AsyncStorage.setItem("@fridaPort", sport)
                                                setFridaPortState(port)
                                            },
                                            'default',
                                            `${fridaPortState}`,
                                            ['输入端口,必须为数字'],
                                        );
                                    }
                                }
                            >设置端口</Button>
                        </View>
                    </View>
                    <View style={{...styles.item}}>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                disabled={!isRunFrida}
                                onPress={
                                    async () => {
                                        try {
                                            await rootShell(`killall ${fridaFileName}`)
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(false)
                                        } catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >停止</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                disabled={!isRunFrida}
                                onPress={
                                    async () => {
                                        try {
                                            await rootShell(`killall ${fridaFileName}`)
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(false)
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            await rootShell(`setsid ${fridaDirState}/${fridaFileName} & > ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(true)
                                        } catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >重启</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                onPress={
                                    async () => {
                                        try {
                                            try {
                                                await rootShell(`killall ${fridaFileName}`)
                                            } catch {

                                            }
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}.log`)
                                            setIsRunFrida(false)
                                            await rootShell(`rm -rf ${fridaDirState}/${fridaFileName}`)
                                        } catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >强制卸载</Button>
                        </View>
                    </View>
                </Card.Body>
            </Card>
            <Card>
                <Card.Header title={"系统操作"}/>
                <Card.Body>
                    <View style={{...styles.item}}>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                onPress={
                                    () => {
                                        Alert.alert("提示", "确定要重启系统吗",
                                            [
                                                {
                                                    text: "确定重启", onPress: async () => {
                                                        try {
                                                            await rootShell(`reboot`)
                                                        } catch (e: any) {
                                                            Alert.alert(e.toString())
                                                        }
                                                    }
                                                },
                                                {
                                                    text: "取消",
                                                    style:'cancel',
                                                },
                                            ])
                                    }
                                }
                            >重启系统</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}>
                            <Button
                                type={'primary'}
                                style={styles.actionButton}
                                onPress={
                                    ()=>{
                                        try{
                                            throw Error("功能开发中");
                                        }catch (e: any) {
                                            Alert.alert(e.toString())
                                        }
                                    }
                                }
                            >安装证书</Button>
                        </View>
                        <View style={{flex: 1}}></View>
                        <View style={{flex: 10}}></View>
                    </View>
                </Card.Body>
            </Card>
        </View>
    );
    async function checkAndInstallFrida() {
        try {
            if((await rootShell(`if [ -f "${fridaDirState}/${fridaFileName}" ];then echo "ok";fi`)).startsWith("ok")==false){
                console.log(`${RNFS.TemporaryDirectoryPath}/tmpFrida`)
                await RNFS.copyFileAssets(`frida-server/frida-server-${fridaVersion}`,`${RNFS.TemporaryDirectoryPath}/tmpFrida`)
                await rootShell(`cp -p ${RNFS.TemporaryDirectoryPath}/tmpFrida ${fridaDirState}/${fridaFileName}`)
                await rootShell(`rm -rf ${RNFS.TemporaryDirectoryPath}/tmpFrida`)
                await rootShell(`chmod 777 ${fridaDirState}/${fridaFileName}`)
            }
        }catch (e:any) {
            Alert.alert(e.toString())
        }
    }
}
export default Index

const styles = StyleSheet.create({
    actionButton: {
        height: 60,
    },
    item: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 20,
    }
})
