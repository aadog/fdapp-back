import React from 'react';
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import Index from "./src";
import {Provider} from "@ant-design/react-native";

const Stack = createNativeStackNavigator();

const App = () => {
    return (
        <Provider>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name={"首页"}
                        component={Index}
                        options={{
                            headerTitleAlign: 'center',
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
};

export default App;
