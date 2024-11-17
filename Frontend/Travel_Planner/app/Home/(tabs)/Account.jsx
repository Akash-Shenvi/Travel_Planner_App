import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Ensure you have this installed

export default function EditProfile() {
  const [name, setName] = useState('Akash Shenvi');
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState(new Date());
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('akashshenvi93@gmail.com');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // For toggling edit mode
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
    }
  };

  const saveProfile = () => {
    alert('Profile Saved');
    setIsEditing(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleDobChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDobPicker(Platform.OS === 'ios'); // For iOS picker dialog handling
    setDob(currentDate);
  };

  const handleAnniversaryChange = (event, selectedDate) => {
    const currentDate = selectedDate || anniversaryDate;
    setShowAnniversaryPicker(Platform.OS === 'ios'); // For iOS picker dialog handling
    setAnniversaryDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding to avoid mobile number hiding
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
          {isEditing ? (
            <TouchableOpacity onPress={saveProfile}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleEdit}>
              <Text style={styles.saveText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePic} />
            ) : (
              <View style={styles.placeholderPic}>
                <Ionicons name="person" size={100} color="gray" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.changePicText}>Change Profile Picture</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            value={name}
            onChangeText={setName}
            editable={isEditing} // Disable input if not editing
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              onPress={() => isEditing && setShowDobPicker(true)}
              style={styles.dateInput}
            >
              <Text>{dob.toDateString()}</Text>
            </TouchableOpacity>
            {showDobPicker && (
              <DateTimePicker
                value={dob}
                mode="date"
                display="default"
                onChange={handleDobChange}
              />
            )}
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={gender}
              onChangeText={setGender}
              editable={isEditing}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Marital Status</Text>
            <TextInput
              style={styles.input}
              placeholder="Married/Single"
              value={maritalStatus}
              onChangeText={setMaritalStatus}
              editable={isEditing}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Anniversary Date</Text>
            <TouchableOpacity
              onPress={() => isEditing && setShowAnniversaryPicker(true)}
              style={styles.dateInput}
            >
              <Text>{anniversaryDate.toDateString()}</Text>
            </TouchableOpacity>
            {showAnniversaryPicker && (
              <DateTimePicker
                value={anniversaryDate}
                mode="date"
                display="default"
                onChange={handleAnniversaryChange}
              />
            )}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nationality</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Nationality"
            value={nationality}
            onChangeText={setNationality}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter City"
            value={city}
            onChangeText={setCity}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter State"
            value={state}
            onChangeText={setState}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={isEditing}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginTop:20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'outfit-Bold',
    color: 'black',
  },
  saveText: {
    fontSize: 16,
    fontFamily: 'outfit-Bold',
    color: '#007AFF',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'gray',
  },
  placeholderPic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  changePicText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontFamily: 'outfit-Medium',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'outfit',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    height: 50,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
});
