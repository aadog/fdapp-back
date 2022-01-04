import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'package:adaptive_dialog/adaptive_dialog.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'root.dart';

class MainWd extends StatefulWidget {
  const MainWd({Key? key}) : super(key: key);

  @override
  _MainWdState createState() => _MainWdState();
}

class _MainWdState extends State<MainWd> {
  bool fridaIsRun=false;
  bool isRoot=false;
  Process? psFrida=null;
  var fridaPath="/data/local/tmp/fsrv.SQVHKE89gQ";
  var _prefs = SharedPreferences.getInstance();

  _MainWdState(){
    init();
  }
  init() async {
    if(Platform.isAndroid){
      isRoot=(await Root.isRooted())!;
      setState(() {
      });
    }

    checkFrida();
    Timer.periodic(Duration(seconds: 3), (timer) async {
      checkFrida();
    });
  }

  checkFrida()async{
    fridaIsRun=(await Root.isProcessRunning("fsrv.SQVHKE89gQ"))!;
    setState(() {

    });
  }
  getFridaPort() async {
    var port=(await _prefs).getInt("fridaPort");
    if(port==null){
      port=1234;
    }
    return port.toString();
  }
  setFridaPort(int port)async{
    (await _prefs).setInt("fridaPort",port);
  }
  static String uint8ToHex(Uint8List byteArr) {
    if (byteArr == null || byteArr.length == 0) {
      return "";
    }
    Uint8List result = Uint8List(byteArr.length << 1);
    var hexTable = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F']; //16进制字符表
    for (var i = 0; i < byteArr.length; i++) {
      var bit = byteArr[i]; //取传入的byteArr的每一位
      var index = bit >> 4 & 15; //右移4位,取剩下四位
      var i2 = i << 1; //byteArr的每一位对应结果的两位,所以对于结果的操作位数要乘2
      result[i2] = hexTable[index].codeUnitAt(0); //左边的值取字符表,转为Unicode放进resut数组
      index = bit & 15; //取右边四位
      result[i2 + 1] = hexTable[index].codeUnitAt(0); //右边的值取字符表,转为Unicode放进resut数组
    }
    return String.fromCharCodes(result); //Unicode转回为对应字符,生成字符串返回
  }
  startFrida() async {
    try{
      Directory tempDir = await getTemporaryDirectory();
      String tempPath = tempDir.path;
      if((await Root.exists(fridaPath))==false){
        var byteData=await rootBundle.load("assets/bindata/fs");
        var f=File("${tempPath}/fd");
        f.writeAsBytesSync(byteData.buffer.asUint8List());
        await Root.exec(cmd: "cp ${tempPath}/fd ${fridaPath}");
        await Root.exec(cmd: "chmod 777 ${fridaPath}");
        await Root.exec(cmd: "rm -rf ${tempPath}/fd");
      }
      await Root.exec(cmd: "setsid ${fridaPath} & >${tempPath}/fsrv.log");

      setState(() {
        fridaIsRun=true;
      });
    }catch(e){
      showOkAlertDialog(context: context,title: "错误",message: e.toString());
    }
  }
  startNetWorkFrida() async {
    try{
      Directory tempDir = await getTemporaryDirectory();
      String tempPath = tempDir.path;
      if((await Root.exists(fridaPath))==false){
        var byteData=await rootBundle.load("assets/bindata/fs");
        var f=File("${tempPath}/fd");
        f.writeAsBytesSync(byteData.buffer.asUint8List());
        await Root.exec(cmd: "cp ${tempPath}/fd ${fridaPath}");
        await Root.exec(cmd: "chmod 777 ${fridaPath}");
        await Root.exec(cmd: "rm -rf ${tempPath}/fd");
      }
      await Root.exec(cmd: "setsid ${fridaPath} -l 0.0.0.0:${await getFridaPort()} & >${tempPath}/fsrv.log");

      setState(() {
        fridaIsRun=true;
      });
    }catch(e){
      showOkAlertDialog(context: context,title: "错误",message: e.toString());
    }
  }
  stopFrida() async {
    try{
      await Root.exec(cmd: "killall -9 fsrv.SQVHKE89gQ");
      setState(() {
        fridaIsRun=false;
      });
    }catch(e){
      showOkAlertDialog(context: context,title: "错误",message: e.toString());
    }
  }
  restartFrida() async {
    await stopFrida();
    await startFrida();
  }
  clearFrida() async {
    await stopFrida();
    try{
      await Root.exec(cmd: "killall -9 fsrv.SQVHKE89gQ");
      setState(() {
        fridaIsRun=false;
      });
      await Root.exec(cmd: "rm -rf ${fridaPath}");
      showOkAlertDialog(context: context,title: "提示",message: "清理成功");
    }catch(e){
      showOkAlertDialog(context: context,title: "错误",message: e.toString());
    }
  }
  settingFridaPort()async{
    try{
      var r=await showTextInputDialog(context: context,
        message: "要设置的网络端口",
        okLabel: "确定",
        cancelLabel: "取消",
        style: AdaptiveStyle.cupertino, textFields: [
          DialogTextField(
            initialText: await getFridaPort(),
            keyboardType: TextInputType.number,
            hintText: "1-65535",
            validator: (v){
              try{
                var nv=int.parse(v!);
                if(nv<1000){
                  return "端口范围为1000-65535";
                }
                if(nv>65535){
                  return "端口范围为1000-65535";
                }
              }catch(e){
                return "端口必须是数字类型";
              }
            },
          ),
        ],);
      if(r!=null){
        await setFridaPort(int.parse(r[0]));
      }
    }catch(e){
      showOkAlertDialog(context: context,title: "错误",message: e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text("fd app"),
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          // mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(padding: EdgeInsets.only(top: 10)),
            Card(child: Column(
              children: [
                ListTile(title: Text('当前越狱状态:${isRoot?"已root":"未root"}'),
                ),
              ],
            ),),
            Padding(padding: EdgeInsets.only(top: 10)),
            Card(
              child: Column(
                children: [
                  ListTile(title: Text('frida 操作'),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: <Widget>[
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: CupertinoButton.filled(
                          padding: EdgeInsets.all(0),
                          child: Text('启动frida'),
                          onPressed: fridaIsRun==false?startFrida:null,
                        ),
                      ),
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: CupertinoButton.filled(
                          padding: EdgeInsets.all(0),
                          child: Text('启动网络frida'),
                          onPressed: fridaIsRun==false?startNetWorkFrida:null,
                        ),
                      ),
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.all(0),
                          child: CupertinoButton.filled(
                            padding: EdgeInsets.all(0),
                            child: Text('设置端口'),
                            onPressed: settingFridaPort,
                          ),
                        ),
                      ),
                      Padding(padding: EdgeInsets.only(left: 10)),
                    ],
                  ),
                  Padding(padding: EdgeInsets.only(top: 30)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: <Widget>[
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: CupertinoButton.filled(
                          padding: EdgeInsets.all(0),
                          child: Text('停止frida'),
                          onPressed: fridaIsRun==true?stopFrida:null,
                        ),
                      ),
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: CupertinoButton.filled(
                          padding: EdgeInsets.all(0),
                          child: Text('重启frida'),
                          onPressed: restartFrida,
                        ),
                      ),
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Padding(padding: EdgeInsets.only(left: 10)),
                      Expanded(
                        child: CupertinoButton.filled(
                          padding: EdgeInsets.all(0),
                          child: Text('强制清理'),
                          onPressed: clearFrida,
                        ),
                      ),
                    ],
                  ),
                  Padding(padding: EdgeInsets.only(top: 30)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }


}
