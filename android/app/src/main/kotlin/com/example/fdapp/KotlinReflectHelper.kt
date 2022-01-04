package com.example.fdapp

import android.util.Log
import io.flutter.plugin.common.MethodCall
import kotlin.jvm.internal.Reflection
import kotlin.reflect.full.*
import kotlin.reflect.jvm.javaMethod
import kotlin.reflect.jvm.kotlinFunction

object KotlinReflectHelper {
    fun invokeMethodForObjectBy(className: String, methodName: String, argv: Array<*>): Any? {
        val myClass = Class.forName(className)
        val myKotlinClass = Reflection.createKotlinClass(myClass)
        myKotlinClass.companionObject!!.functions.forEach {
            if (it.name == methodName) {
                return it.call(myKotlinClass.companionObject!!.objectInstance,*argv)
            }
        }
        throw Exception("No method named : $methodName found for the $className object")
    }
}