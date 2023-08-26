import {
	AntDesign,
	Entypo,
	Feather,
	FontAwesome,
	Ionicons,
	MaterialIcons,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import COLORS from "../constants/colors";
import {
	BeersVenue,
	Breweries,
	Dashboard,
	Feedback,
	FindABeer,
	Forums,
	Journal,
	NearbyVenues,
	Profile,
	Recommendation,
	ReferAFriend,
	Social,
	Welcome,
	Wishlist,
} from "../screens";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => {
	return (
		<Stack.Navigator>
			<Stack.Screen
				name="Home"
				component={Dashboard}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="BeersVenue"
				component={BeersVenue}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="FindABeer"
				component={FindABeer}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="NearbyVenues"
				component={NearbyVenues}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Breweries"
				component={Breweries}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Social"
				component={Social}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Forums"
				component={Forums}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="ReferAFriend"
				component={ReferAFriend}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Recommendation"
				component={Recommendation}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="Feedback"
				component={Feedback}
				options={{ headerShown: false }}
			/>
		</Stack.Navigator>
	);
};

const screenOptions = {
	tabBarShowLabel: false,
	headerShown: false,
	tabBarHideOnKeyboard: true,
	tabBarStyle: {
		position: "absolute",
		bottom: 0,
		right: 0,
		left: 0,
		elevation: 20,
		height: 50,
		backgroundColor: COLORS.secondary,
	},
};

const BottomTabNavigation = () => {
	return (
		<Tab.Navigator screenOptions={screenOptions}>
			<Tab.Screen
				name="Dashboard"
				component={DashboardStack}
				options={{
					tabBarIcon: ({ focused }) => {
						return (
							<FontAwesome
								name="home"
								size={26}
								color={focused ? COLORS.foam : COLORS.black}
							/>
						);
					},
				}}
			/>
			<Tab.Screen
				name="Profile"
				component={Profile}
				options={{
					tabBarIcon: ({ focused }) => {
						return (
							<FontAwesome
								name="user-circle"
								size={24}
								color={focused ? COLORS.foam : COLORS.black}
							/>
						);
					},
				}}
			/>
			<Tab.Screen
				name="Journal"
				component={Journal}
				options={{
					tabBarIcon: ({ focused }) => {
						return (
							<Ionicons
								name="journal"
								size={24}
								color={focused ? COLORS.foam : COLORS.black}
							/>
						);
					},
				}}
			/>
			<Tab.Screen
				name="Wishlist"
				component={Wishlist}
				options={{
					tabBarIcon: ({ focused }) => {
						return (
							<Ionicons
								name="list-circle"
								size={32}
								color={focused ? COLORS.foam : COLORS.black}
							/>
						);
					},
				}}
			/>
			<Tab.Screen
				name="Welcome"
				component={Welcome}
				options={{
					tabBarIcon: ({ focused }) => {
						return (
							<AntDesign
								name="logout"
								size={24}
								color={focused ? COLORS.foam : COLORS.black}
							/>
						);
					},
				}}
			/>
		</Tab.Navigator>
	);
};

export default BottomTabNavigation;
