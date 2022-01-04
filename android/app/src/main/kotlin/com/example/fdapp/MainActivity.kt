package com.example.fdapp

import android.util.Log
import androidx.annotation.NonNull
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugins.GeneratedPluginRegistrant
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel
import com.stericson.RootTools.RootTools;
import com.topjohnwu.superuser.Shell;
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel.Result
import okreflect.OkReflect
import java.lang.Exception
import kotlin.math.log
import kotlin.reflect.full.companionObject
import kotlin.reflect.full.declaredMemberFunctions
import kotlin.reflect.full.staticFunctions


public class MainActivity : FlutterActivity() {

    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "root").setMethodCallHandler {
            // Note: this method is invoked on the main thread.
                call, result ->
            try {
                var argv = listOf(call, result)
                KotlinReflectHelper.invokeMethodForObjectBy(
                    this.javaClass.name,
                    call.method,
                    argv.toTypedArray()
                )
            } catch (e: Exception) {
                Log.e("error", e.toString())
                Log.e("error", e.message!!)
                result.error(e.toString(),e.message.toString(),e)
            }
//            if (call.method.equals("ExecuteCommand")) {
//                ExecuteCommand(call,result)
//            } else if(call.method.equals("isRooted")){
//                isRooted(call,result)
//            } else if(call.method.equals("exists")){
//                exists(call,result)
//            } else if(call.method.equals("isProcessRunning")){
//                isProcessRunning(call,result)
//            } else{
//                result.notImplemented();
//            }
        }
    }


    companion object {
        @JvmStatic
        fun isProcessRunning(@NonNull call: MethodCall, @NonNull result: Result) {
            result.success(
                RootTools.isProcessRunning(
                    call.argument<String?>("processName").toString()
                )
            )
        }

        @JvmStatic
        fun exists(@NonNull call: MethodCall, @NonNull result: Result) {
            result.success(RootTools.exists(call.argument<String?>("file").toString()))
        }

        @JvmStatic
        fun isRooted(@NonNull call: MethodCall, @NonNull result: Result) {
            result.success(RootTools.isAccessGiven())
        }

        @JvmStatic
        fun ExecuteCommand(@NonNull call: MethodCall, @NonNull result: Result) {

            var resultText: List<String>? = null
            var command: String? = null
            var stringBuilder: StringBuilder? = null
            command = call.argument("cmd");
            var job=Shell.sh(command)

            resultText = job.exec().getOut();
            stringBuilder = StringBuilder()
            for (data in resultText!!) {
                stringBuilder!!.append(data);
                stringBuilder!!.append("\n");
            }
            result.success(String.format("%s", stringBuilder));
        }
    }
}
