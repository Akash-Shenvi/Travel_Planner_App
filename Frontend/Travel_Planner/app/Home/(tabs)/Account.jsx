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
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';

const STATES_OF_INDIA = [
  { label: 'Andhra Pradesh', value: 'Andhra Pradesh' },
  { label: 'Arunachal Pradesh', value: 'Arunachal Pradesh' },
  { label: 'Assam', value: 'Assam' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Chhattisgarh', value: 'Chhattisgarh' },
  { label: 'Goa', value: 'Goa' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Haryana', value: 'Haryana' },
  { label: 'Himachal Pradesh', value: 'Himachal Pradesh' },
  { label: 'Jharkhand', value: 'Jharkhand' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Kerala', value: 'Kerala' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Manipur', value: 'Manipur' },
  { label: 'Meghalaya', value: 'Meghalaya' },
  { label: 'Mizoram', value: 'Mizoram' },
  { label: 'Nagaland', value: 'Nagaland' },
  { label: 'Odisha', value: 'Odisha' },
  { label: 'Punjab', value: 'Punjab' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Sikkim', value: 'Sikkim' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'Telangana', value: 'Telangana' },
  { label: 'Tripura', value: 'Tripura' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Uttarakhand', value: 'Uttarakhand' },
  { label: 'West Bengal', value: 'West Bengal' },
];

export default function EditProfile() {
  const [name, setName] = useState('Akash Shenvi');
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('akashshenvi93@gmail.com');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const saveProfile = () => {
    alert('Profile Saved');
    setIsEditing(false);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const logout = () => {
    alert('Logged Out');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Ionicons name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Edit Profile</Text>
          <TouchableOpacity
            onPress={isEditing ? saveProfile : toggleEdit}
            style={[styles.actionButton, isEditing && styles.saveButton]}
          >
            <Text style={styles.actionButtonText}>
              {isEditing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={() => console.log('Change Profile Picture')}>
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
            editable={isEditing}
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
              <DatePicker
                modal
                open={showDobPicker}
                date={dob}
                mode="date"
                onConfirm={(date) => {
                  setDob(date);
                  setShowDobPicker(false);
                }}
                onCancel={() => setShowDobPicker(false)}
              />
            )}
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Gender</Text>
            <Picker
              selectedValue={gender}
              onValueChange={(value) => setGender(value)}
              enabled={isEditing}
              style={styles.picker}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Marital Status</Text>
          <TextInput
            style={styles.input}
            placeholder="Married/Single"
            value={maritalStatus}
            onChangeText={setMaritalStatus}
            editable={isEditing}
          />
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
          <Picker
            selectedValue={state}
            onValueChange={(value) => setState(value)}
            enabled={isEditing}
            style={styles.picker}
          >
            <Picker.Item label="Select State" value="" />
            {STATES_OF_INDIA.map((state) => (
              <Picker.Item key={state.value} label={state.label} value={state.value} />
            ))}
          </Picker>
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

        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    marginTop: 20,
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
  profilePicContainer: {
    alignItems: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePicText: {
    marginTop: 10,
    color: '#007BFF',
  },
  label: {
    fontSize: 14,
    fontFamily: 'outfit-R',
    color: 'gray',
  },
  inputContainer: {
    marginVertical: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    fontFamily: 'outfit-R',
  },
  picker: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'outfit-R',
    height: 50,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontFamily: 'outfit-R',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: 'green',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'red',
    paddingVertical: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'outfit-R',
  },
});
