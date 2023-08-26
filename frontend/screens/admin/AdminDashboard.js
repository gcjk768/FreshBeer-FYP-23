import {
	FontAwesome5,
	Ionicons,
	MaterialIcons,
	Octicons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { Header } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCookies } from "../../CookieContext";
import COLORS from "../../constants/colors";
import GlobalStyle from "../../utils/GlobalStyle";

const Button = (props) => {
	const filledBgColor = props.color || COLORS.primary;
	const outlinedColor = COLORS.white;
	const bgColor = props.filled ? filledBgColor : outlinedColor;
	const textColor = COLORS.black;

	return (
		<TouchableOpacity
			style={{
				...styles.button,
				...{ backgroundColor: bgColor },
				...props.style,
			}}
			onPress={props.onPress}
		>
			<Text
				style={{
					fontSize: 12,
					...GlobalStyle.bodyFont,
					...{ color: textColor },
				}}
			>
				{props.title}
			</Text>
		</TouchableOpacity>
	);
};

const CustomText = (props) => {
	return (
		<Text style={{ ...GlobalStyle.bodyFont, ...props.style }}>
			{props.children}
		</Text>
	);
};

const AdminLogin = ({ navigation }) => {
	const { cookies } = useCookies();
	const [username, setUsername] = useState("");

	useEffect(() => {
		setUsername(cookies.username);
	}, [cookies.username]);

	return (
		<View style={{ flex: 1 }}>
			<SafeAreaView style={{ flex: 1 }} backgroundColor={COLORS.secondary}>
				<Header
					placement="left"
					backgroundColor={COLORS.primary}
					containerStyle={{
						height: 100,
						borderBottomLeftRadius: 40,
						borderBottomRightRadius: 40,
					}}
					centerComponent={{
						text: "FreshBeer",
						style: {
							fontSize: 20,
							...GlobalStyle.headerFont,
							flexDirection: "row",
							justifyContent: "flex-start",
						},
					}}
					rightComponent={
						<View style={{ flexDirection: "row" }}>
							<TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
								<MaterialIcons name="logout" size={24} color={COLORS.black} />
							</TouchableOpacity>
						</View>
					}
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								marginTop: 5,
							}}
						>
							<Text
								style={{
									fontSize: 26,
									color: COLORS.black,
									marginTop: 20,
									marginBottom: 12,
									...GlobalStyle.headerFont,
								}}
							>
								Welcome, {username}
							</Text>
							<Text style={{ ...GlobalStyle.headerFont, marginBottom: 25 }}>
								What would you like to do?
							</Text>
						</View>

						<View style={{ marginHorizontal: 22 }}>
							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginVertical: 12,
								}}
							>
								Reports and Requests
							</Text>
							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
								}}
							>
								<TouchableOpacity
									onPress={() => navigation.navigate("ReportedBugs")}
									style={styles.container}
								>
									<CustomText>Reported Bugs</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5 name="bug" size={34} color={COLORS.foam} />
									</View>
								</TouchableOpacity>
							</View>

							<Text
								style={{
									fontSize: 18,
									...GlobalStyle.headerFont,
									marginVertical: 12,
								}}
							>
								Management
							</Text>
							<View
								style={{
									flexDirection: "row",
									flexWrap: "wrap",
									marginBottom: 10,
								}}
							>
								<TouchableOpacity
									onPress={() => navigation.navigate("ManageUsers")}
									style={styles.container}
								>
									<CustomText>User Management</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="user-alt"
											size={34}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("ManageBrewery")}
									style={styles.container}
								>
									<CustomText>Brewery Management</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="house-user"
											size={34}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => navigation.navigate("ManageVenue")}
									style={styles.container}
								>
									<CustomText>Venue Management</CustomText>
									<View
										style={{ alignItems: "center", justifyContent: "center" }}
									>
										<FontAwesome5
											name="house-user"
											size={34}
											color={COLORS.foam}
										/>
									</View>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingVertical: 10,
		borderColor: COLORS.black,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	container: {
		height: 100,
		elevation: 2,
		backgroundColor: COLORS.grey,
		marginLeft: 10,
		marginTop: 10,
		borderRadius: 15,
		marginBottom: 3,
		width: "45%",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default AdminLogin;
