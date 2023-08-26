import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
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

// popup to redeem awards
const PopUp = ({ visible, onClose, handleSubmitYes }) => {
	const [popupVisible2, setPopupVisible2] = useState(false); // 2nd popup
	const [rewards, setRewards] = useState([]);
	const [selectedRewardID, setSelectedRewardID] = useState(null);
	const [selectedRewardPrice, setSelectedRewardPrice] = useState(null);
	const { cookies } = useCookies();

	const handlePopUp2 = (reward) => {
		setPopupVisible2(!popupVisible2);
		setSelectedRewardID(reward.rewardID);
		setSelectedRewardPrice(reward.rewardPrice);
	};

	const handleYes = () => {
		const data = {
			userID: cookies.userID,
			rewardID: selectedRewardID,
			rewardPrice: selectedRewardPrice,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/redeemRewards", data)
			.then((response) => {
				if (response.data.success) {
					setPopupVisible2(!popupVisible2);
					handleSubmitYes();
				} else {
					const { message } = response.data;
					Alert.alert("Error!", message);
					setPopupVisible2(!popupVisible2);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	};

	useEffect(() => {
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getRewards")
			.then((response) => {
				setRewards(response.data.rewards);
			})
			.catch((error) => {
				console.error("Error retrieving rewards:", error);
			});
	}, []);

	return (
		<Modal visible={visible} transparent animationType="slide">
			<View
				style={{
					width: "100%",
					height: "100%",
					backgroundColor: COLORS.secondary,
					borderRadius: 10,
					paddingHorizontal: 20,
					elevation: 5,
				}}
			>
				<TouchableOpacity onPress={onClose}>
					<Ionicons
						name="arrow-back"
						size={24}
						color={COLORS.black}
						style={{ marginTop: 12 }}
					/>
				</TouchableOpacity>

				<View style={{ marginTop: 20, marginHorizontal: 12 }}>
					{rewards.map((reward) => (
						<TouchableOpacity
							key={reward.rewardID}
							style={{
								width: "100%",
								borderColor: 0,
								paddingHorizontal: 20,
								paddingVertical: 10,
								borderRadius: 5,
								backgroundColor: COLORS.grey,
								elevation: 2,
								marginBottom: 20,
							}}
							onPress={() => handlePopUp2(reward)}
						>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								<Image
									source={require("../../assets/beer.png")}
									style={{
										height: 70,
										width: 70,
										marginRight: 10,
									}}
									resizeMode="contain"
								/>
								<View
									style={{
										flex: 1,
										flexDirection: "row",
										justifyContent: "space-between",
									}}
								>
									<CustomText style={{ flexWrap: "wrap" }}>
										{reward.rewardName}
									</CustomText>
								</View>
								<CustomText>{reward.rewardPrice} points</CustomText>
							</View>

							{/* 2nd popup */}
							<Modal visible={popupVisible2} transparent animationType="fade">
								<View
									style={{
										flex: 1,
										backgroundColor: "rgba(0, 0, 0, 0.5)",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<View
										style={{
											width: "80%",
											backgroundColor: COLORS.white,
											borderRadius: 40,
											padding: 30,
											justifyContent: "center",
											alignItems: "center",
										}}
									>
										<CustomText>Are you sure you want to redeem?</CustomText>
										<View style={{ flexDirection: "row" }}>
											<Button
												title="Yes"
												filled
												style={{
													width: "40%",
													borderRadius: 10,
													marginTop: 15,
													borderColor: 0,
													elevation: 2,
													marginRight: 12,
												}}
												onPress={handleYes}
											/>
											<Button
												title="No"
												filled
												style={{
													width: "40%",
													borderRadius: 10,
													marginTop: 15,
													borderColor: 0,
													elevation: 2,
												}}
												onPress={handlePopUp2}
											/>
										</View>
									</View>
								</View>
							</Modal>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</Modal>
	);
};

// custom alert for successful and unsuccessful referral codes
const CustomReferralAlert = ({ visible, onClose, title, message }) => {
	return (
		<Modal visible={visible} transparent animationType="fade">
			<View
				style={{
					flex: 1,
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<View
					style={{
						width: "80%",
						backgroundColor: COLORS.white,
						borderRadius: 20,
						padding: 30,
					}}
				>
					<Ionicons
						name="md-beer"
						size={34}
						color={COLORS.foam}
						style={{ alignSelf: "center" }}
					/>
					<Text
						style={{
							fontSize: 18,
							...GlobalStyle.headerFont,
							alignSelf: "center",
							marginBottom: 20,
						}}
					>
						{title}
					</Text>
					<CustomText
						style={{
							alignSelf: "center",
							fontSize: 16,
							marginBottom: 20,
						}}
					>
						{message}
					</CustomText>
					<TouchableOpacity
						style={{
							backgroundColor: COLORS.foam,
							padding: 10,
							borderRadius: 8,
							alignItems: "center",
							marginTop: 20,
						}}
						onPress={onClose}
					>
						<Text style={{ ...GlobalStyle.headerFont, fontSize: 16 }}>OK</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const ReferAFriend = ({ navigation }) => {
	const [popupVisible, setPopupVisible] = useState(false);
	const { cookies } = useCookies();
	const [userID, setUserID] = useState("");
	const [userData, setUserData] = useState([]);
	const [referralCode, setReferralCode] = useState("");
	const [rewards, setRewards] = useState([]);
	const [referralState, setReferralState] = useState(false);
	const [submitYesState, setSubmitYesState] = useState(false);
	const [isReferralVisible, setIsReferralVisible] = useState(false);
	const [ReferralTitle, setReferralTitle] = useState("");
	const [ReferralMessage, setReferralMessage] = useState("");

	// for copy button
	const copyText = (text) => {
		Clipboard.setString(text);
	};

	const setInputToCopiedText = async () => {
		const text = await Clipboard.getStringAsync();
		setReferralCode(text);
	};

	const handlePopup = () => {
		setPopupVisible(!popupVisible); // created 1st modal
	};

	const handleSubmitYes = () => {
		setSubmitYesState(true);
	};

	const submitReferral = () => {
		const data = {
			userID: userID,
			referralCode: referralCode,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/submitReferralCode", data)
			.then((response) => {
				if (response.data.success) {
					const { username } = response.data;
					setReferralTitle("Success!");
					setReferralMessage(
						`You claimed a referral from ${username}. Both of you gained 50 points!`
					);
					setReferralState(true);
					setReferralCode("");
				} else {
					const { message } = response.data;
					setReferralTitle("Error");
					setReferralMessage(message);
				}
				setIsReferralVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	useEffect(() => {
		setUserID(cookies.userID);
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getReferralCode", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				const { referralCode, referralPoints, rewardData } = response.data;
				setUserData({ referralCode, referralPoints });
				setRewards(rewardData);
				setReferralState(false);
				setSubmitYesState(false);
			})
			.catch((error) => {
				console.error("Error retrieving userData:", error);
			});
	}, [referralState, submitYesState]);

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
					leftComponent={
						<View
							style={{
								flexDirection: "row",
							}}
						>
							<TouchableOpacity onPress={() => navigation.goBack()}>
								<MaterialIcons
									name="keyboard-arrow-left"
									size={24}
									color={COLORS.black}
								/>
							</TouchableOpacity>
						</View>
					}
					centerComponent={{
						text: "FreshBeer",
						style: {
							fontSize: 20,
							...GlobalStyle.headerFont,
							flexDirection: "row",
							justifyContent: "flex-start",
						},
					}}
				/>

				<SafeAreaView style={{ flex: 1 }}>
					<View style={styles.grid}>
						<Button
							title="My Feed"
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("Social")}
						/>
						<Button
							title="Forums"
							color={COLORS.white}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("Forums")}
						/>
						<Button
							title="Refer a friend"
							color={COLORS.foam}
							filled
							style={styles.longButton}
							onPress={() => navigation.navigate("ReferAFriend")}
						/>
						<Button
							title="Recommendations"
							color={COLORS.white}
							filled
							style={{
								width: "35%",
								height: 55,
								marginVertical: 0,
								borderRadius: 20,
								marginRight: 10,
								borderColor: 0,
								elevation: 2,
							}}
							onPress={() => navigation.navigate("Recommendation")}
						/>
					</View>

					<View style={{ marginHorizontal: 20, marginTop: 20 }}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<CustomText style={{ fontSize: 15 }}>
								Your referral code: {userData.referralCode}
							</CustomText>
							<Button
								title="Copy"
								color={COLORS.foam}
								filled
								style={{
									width: "20%",
									borderRadius: 30,
									borderColor: 0,
								}}
								onPress={() => copyText(userData.referralCode)}
							/>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								marginTop: 10,
							}}
						>
							<CustomText style={{ fontSize: 15 }}>
								Your points: {userData.referralPoints}
							</CustomText>
							<Button
								title="Redeem"
								onPress={handlePopup}
								color={COLORS.foam}
								filled
								style={{
									width: "20%",
									borderRadius: 30,
									borderColor: 0,
								}}
							/>
							<PopUp
								visible={popupVisible}
								onClose={handlePopup}
								handleSubmitYes={handleSubmitYes}
							/>
						</View>

						<View
							style={{
								borderBottomColor: COLORS.black,
								borderBottomWidth: 1,
								marginVertical: 20,
							}}
						/>
						<Text style={{ ...GlobalStyle.headerFont }}>Have a referral?</Text>
						<View
							style={{
								height: 50,
								backgroundColor: COLORS.white,
								borderRadius: 10,
								flexDirection: "row",
								paddingHorizontal: 20,
								alignItems: "center",
								marginTop: 12,
								marginBottom: 12,
								marginRight: 5,
								elevation: 2,
							}}
						>
							<TextInput
								placeholder="eg. XYZABC"
								style={{ ...GlobalStyle.bodyFont }}
								value={referralCode}
								onChangeText={(text) => setReferralCode(text)}
							/>
						</View>
						<View
							style={{
								justifyContent: "center",
								alignItems: "flex-end",
							}}
						>
							<Button
								title="Submit"
								color={COLORS.foam}
								filled
								style={{
									width: "40%",
									borderRadius: 10,
									borderColor: 0,
									elevation: 2,
								}}
								onPress={submitReferral}
							/>
							<CustomReferralAlert
								visible={isReferralVisible}
								onClose={() => setIsReferralVisible(false)}
								title={ReferralTitle}
								message={ReferralMessage}
							/>
						</View>
					</View>

					<SafeAreaView style={{ flex: 1 }}>
						<View style={{ marginHorizontal: 20 }}>
							<Text style={{ ...GlobalStyle.headerFont }}>Your Rewards</Text>
							<ScrollView
								contentContainerStyle={{ paddingBottom: 80 }}
								showsVerticalScrollIndicator={false}
							>
								{rewards.map((reward, index) => (
									<View
										key={index}
										style={{
											width: "100%",
											borderColor: 0,
											paddingHorizontal: 20,
											paddingVertical: 10,
											borderRadius: 10,
											backgroundColor: COLORS.grey,
											elevation: 2,
											marginBottom: 10,
										}}
									>
										<View
											style={{ flexDirection: "row", alignItems: "center" }}
										>
											<Image
												source={require("../../assets/beer.png")}
												style={{
													height: 70,
													width: 70,
													marginRight: 10,
												}}
												resizeMode="contain"
											/>
											<CustomText>{reward.rewardName}</CustomText>
										</View>
									</View>
								))}
							</ScrollView>
						</View>
					</SafeAreaView>
				</SafeAreaView>
			</SafeAreaView>
		</View>
	);
};

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 20,
	},
	longButton: {
		width: "18%",
		height: 55,
		marginVertical: 0,
		borderRadius: 20,
		marginRight: 10,
		borderColor: 0,
		elevation: 2,
	},
	button: {
		paddingVertical: 10,
		borderColor: COLORS.grey,
		borderWidth: 1,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default ReferAFriend;
