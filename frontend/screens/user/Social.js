import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import axios from "axios";
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
import { AirbnbRating } from "react-native-ratings";
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

// custom alert for follow and unfollow
const CustomFollowAlert = ({ visible, onClose, title, message }) => {
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

const FeedItem = ({
	reviewID,
	reviewUser,
	reviewDate,
	reviewDescription,
	reviewRating,
	reviewUsername,
	followArray,
	userID,
	isFollowing,
	feedImage,
	updateFollowArray,
}) => {
	const [isFollowVisible, setIsFollowVisible] = useState(false);
	const [FollowTitle, setFollowTitle] = useState("");
	const [FollowMessage, setFollowMessage] = useState("");

	const handleFollow = () => {
		const data = {
			userID: userID,
			reviewUserID: reviewUser,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/followUser", data)
			.then((response) => {
				if (response.data.success) {
					updateFollowArray(reviewUser, true);
					setFollowTitle("Success!");
					setFollowMessage("You followed!");
				}
				setIsFollowVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleUnfollow = () => {
		const data = {
			userID: userID,
			reviewUserID: reviewUser,
		};
		axios
			.post("https://fresh-beer-near-me-6e244313be42.herokuapp.com/unfollowUser", data)
			.then((response) => {
				if (response.data.success) {
					updateFollowArray(reviewUser, false);
					setFollowTitle("Bye!");
					setFollowMessage("You unfollowed");
				}
				setIsFollowVisible(true);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<View style={{ marginHorizontal: 20 }}>
			<View style={styles.feedContainer}>
				<View style={{ marginHorizontal: 12 }}>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "center",
							backgroundColor: COLORS.grey,
							marginTop: 5,
						}}
					>
						<Text style={{ ...GlobalStyle.headerFont, fontSize: 18 }}>
							{reviewUsername}
						</Text>
						{reviewUser !== userID ? (
							isFollowing ? (
								<Button
									title="Unfollow"
									filled
									style={{
										width: "50%",
										borderRadius: 30,
										borderColor: 0,
									}}
									onPress={handleUnfollow}
								/>
							) : (
								<Button
									title="Follow"
									filled
									style={{
										width: "50%",
										borderRadius: 30,
										borderColor: 0,
									}}
									onPress={handleFollow}
								/>
							)
						) : null}
						<CustomFollowAlert
							visible={isFollowVisible}
							onClose={() => setIsFollowVisible(false)}
							title={FollowTitle}
							message={FollowMessage}
						/>
					</View>

					<View>
						<Text
							style={{
								...GlobalStyle.headerFont,
								fontSize: 14,
								marginTop: 12,
							}}
						>
							{reviewDate}
						</Text>
					</View>
					<Image source={{ uri: feedImage }} style={styles.feedImage} />
					<CustomText style={{ marginTop: 10 }}>{reviewDescription}</CustomText>
					<View
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
						}}
					>
						<AirbnbRating
							count={5}
							defaultRating={reviewRating}
							size={18}
							showRating={false}
							isDisabled={true}
						/>
					</View>
				</View>
			</View>
		</View>
	);
};

const Social = ({ navigation }) => {
	const { cookies } = useCookies();
	const [userID, setUserID] = useState("");
	const [feedData, setFeedData] = useState([]);
	const [originalFeedData, setOriginalFeedData] = useState([]);
	const [searchInput, setSearchInput] = useState("");

	const updateFollowArray = (reviewUserID, isFollowing) => {
		setFeedData((prevFeedData) =>
			prevFeedData.map((feed) =>
				feed.reviewUser === reviewUserID ? { ...feed, isFollowing } : feed
			)
		);
	};

	useEffect(() => {
		setUserID(cookies.userID);
		axios
			.get("https://fresh-beer-near-me-6e244313be42.herokuapp.com/getFeed", {
				params: {
					userID: cookies.userID,
				},
			})
			.then((response) => {
				setFeedData(response.data.reviews);
				setOriginalFeedData(response.data.reviews);
			})
			.catch((error) => {
				console.error("Error retrieving feed:", error);
			});
	}, []);

	const handleSearch = (text) => {
		setSearchInput(text);
		const filteredFeedData = originalFeedData.filter((feed) =>
			feed.reviewUsername.toLowerCase().includes(text.toLowerCase())
		);
		setFeedData(filteredFeedData);
	};

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
							color={COLORS.foam}
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
							color={COLORS.white}
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

					<View style={styles.searchContainer}>
						<TextInput
							placeholder="Search user"
							style={{ ...GlobalStyle.bodyFont, ...styles.searchInput }}
							onChangeText={handleSearch}
							value={searchInput}
						/>
					</View>

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}
					>
						{feedData.map((feed) => (
							<FeedItem
								key={feed.reviewID}
								reviewID={feed.reviewID}
								reviewUser={feed.reviewUser}
								reviewDate={feed.reviewDate}
								reviewDescription={feed.reviewDescription}
								reviewRating={feed.reviewRating}
								reviewUsername={feed.reviewUsername}
								followArray={feed.followArray}
								isFollowing={feed.isFollowing}
								feedImage={feed.feedImage}
								userID={userID}
								updateFollowArray={updateFollowArray}
							/>
						))}
					</ScrollView>
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
	searchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginHorizontal: 20,
		marginVertical: 12,
	},
	searchInput: {
		flex: 1,
		height: 45,
		borderWidth: 1,
		borderColor: 0,
		borderRadius: 20,
		paddingHorizontal: 20,
		marginRight: 10,
		backgroundColor: COLORS.grey,
	},
	feedContainer: {
		backgroundColor: COLORS.grey,
		flexDirection: "column",
		width: "100%",
		borderRadius: 26,
		padding: 10,
		borderWidth: 1,
		borderColor: 0,
		marginVertical: 12,
	},
	feedImage: {
		width: "100%",
		height: 200,
		resizeMode: "cover",
		borderRadius: 10,
		marginTop: 10,
	},
});

export default Social;
