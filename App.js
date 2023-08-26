import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { CookieProvider } from "./frontend/CookieContext";
import BottomTabNavigation from "./frontend/navigation/BottomTabNavigation";
import {
	AdminDashboard,
	Analytics,
	CreateEvents,
	CreatePromotion,
	InquiriesNFeedback,
	ManageBrewery,
	ManageInventory,
	ManageUsers,
	ManageVenue,
	ReportedBugs,
	Respond,
	Signup,
	VenueComparison,
	VenueOwnerHome,
	VenueProfile,
	Welcome,
} from "./frontend/screens";

const Stack = createNativeStackNavigator();

export default function App() {
	const [fontsLoaded] = useFonts({
		"Poppins-Regular": require("./frontend/assets/fonts/Poppins-Regular.ttf"),
		"Poppins-Bold": require("./frontend/assets/fonts/Poppins-Bold.ttf"),
	});
	useEffect(() => {
		async function prepare() {
			await SplashScreen.preventAutoHideAsync();
		}
		prepare();
	}, []);

	if (!fontsLoaded) {
		return undefined;
	} else {
		SplashScreen.hideAsync();
	}

	return (
		<CookieProvider>
			<NavigationContainer>
				<Stack.Navigator initialRouteName="Welcome">
					<Stack.Screen
						name="Welcome"
						component={Welcome}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Signup"
						component={Signup}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="BottomTabNavigation"
						component={BottomTabNavigation}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="AdminDashboard"
						component={AdminDashboard}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ManageUsers"
						component={ManageUsers}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="VenueOwnerHome"
						component={VenueOwnerHome}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="InquiriesNFeedback"
						component={InquiriesNFeedback}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Respond"
						component={Respond}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ReportedBugs"
						component={ReportedBugs}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ManageBrewery"
						component={ManageBrewery}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ManageVenue"
						component={ManageVenue}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="VenueProfile"
						component={VenueProfile}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="ManageInventory"
						component={ManageInventory}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="CreateEvents"
						component={CreateEvents}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="CreatePromotion"
						component={CreatePromotion}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="Analytics"
						component={Analytics}
						options={{ headerShown: false }}
					/>
					<Stack.Screen
						name="VenueComparison"
						component={VenueComparison}
						options={{ headerShown: false }}
					/>
				</Stack.Navigator>
			</NavigationContainer>
		</CookieProvider>
	);
}
