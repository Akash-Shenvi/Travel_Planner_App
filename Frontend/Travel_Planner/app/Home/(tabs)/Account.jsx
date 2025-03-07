import React, { useState, useEffect } from 'react';
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
  Alert,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRouter } from 'expo-router';

export default function EditProfile() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [nationality, setNationality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);



  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/view_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setName(data?.profile?.name || '');
        setDob(data?.profile?.dob || '');
        setGender(data.profile?.gender || '');
        setMaritalStatus(data.profile?.marital_status || '');
        setNationality(data.profile?.nationality || '');
        setCity(data.profile?.city || '');
        setState(data.profile?.state || '');
        setEmail(data.profile?.email || '');
        setPhone(data.profile?.phone || '');
        setProfileImage(data.profile_image || null);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch profile data');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  const saveProfile = async () => {
    const profileData = {
      dob,
      gender,
      marital_status: maritalStatus,
      nationality,
      city,
      state,
    };

    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message || 'Profile updated successfully');
        setIsEditing(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

   const toggleEdit = () => setIsEditing(!isEditing);

  const logout = async () => {
    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/logout', {
        method: 'POST',
        credentials: 'include', // Include cookies if required
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Logged Out', data.message || 'You have been logged out.');
        setTimeout(() => {
          router.replace('auth/sign-in');
        }, 2000);
      } else {
        Alert.alert('Error', data.message || 'Failed to log out.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };
  const handleAboutUs = () => {
  setMenuVisible(false);
  router.push('/about-us'); // Replace with your actual route for About Us
};

const handleContactUs = () => {
  setMenuVisible(false);
  router.push('/contact-us'); // Replace with your actual route for Contact Us
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
  
  <Text style={styles.headerTitle}>Profile</Text>
  <View style={styles.headerActions}>
    <TouchableOpacity
      style={[styles.editButton, isEditing && styles.saveButton]}
      onPress={isEditing ? saveProfile : toggleEdit}
    >
      <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setMenuVisible(true)}>
      <Ionicons name="ellipsis-vertical" size={24} color="black" />
    </TouchableOpacity>
  </View>
</View>

<Modal
  visible={menuVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setMenuVisible(false)}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    onPress={() => setMenuVisible(false)}
  >
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={handleAboutUs} style={styles.menuOption}>
        <Text style={styles.menuText}>About Us</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleContactUs} style={styles.menuOption}>
        <Text style={styles.menuText}>Contact Us</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

        <View style={styles.profilePictureContainer}>
          <TouchableOpacity onPress={() => console.log('Change Profile Picture')}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePicture} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Ionicons name="person" size={80} color="#ccc" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.changePictureText}>Change Profile Picture</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={dob}
            onChangeText={setDob}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <Picker
            selectedValue={gender}
            onValueChange={(value) => setGender(value)}
            enabled={isEditing}
            style={styles.input}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Marital Status</Text>
          <Picker
            selectedValue={maritalStatus}
            onValueChange={(value) => setMaritalStatus(value)}
            enabled={isEditing}
            style={styles.input}
          >
            <Picker.Item label="Select Status" value="" />
            <Picker.Item label="Married" value="Married" />
            <Picker.Item label="Single" value="Single" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>State</Text>
          <Picker
            selectedValue={state}
            onValueChange={(value) => setState(value)}
            enabled={isEditing}
            style={styles.input}
          >
            <Picker.Item label="Select State" value="" />
            {indianStates.map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nationality</Text>
          <TextInput
            style={styles.input}
            placeholder="Nationality"
            value={nationality}
            onChangeText={setNationality}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
            editable={isEditing}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} editable={false} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} value={phone} editable={false} />
        </View>
            <View style={styles.inputContainer}>
       <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
          </View>
          
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 40,
    fontFamily: 'outfit',
  },
  editButton: {
  paddingVertical: 10,  // Increased padding for better touch area
  paddingHorizontal: 20, // More space horizontally for the text
  marginTop: 16,
  backgroundColor: '#ccc', // Soft background color
  borderRadius: 8, // Smooth rounded corners
  alignItems: 'center', // Center the text inside the button
  justifyContent: 'center', 
  shadowColor: '#000', // Subtle shadow effect
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3, // Shadow effect for Android
  transition: 'background-color 0.3s ease', // Smooth background change transition
  alignSelf: 'flex-start',
  marginRight:15, // Align the button to the left side
},
saveButton: {
  backgroundColor: '#4caf50', // Green background for save
  paddingVertical: 12, // Increased padding for better touch area
  paddingHorizontal: 20, // More space horizontally for the text
  borderRadius: 8, // Rounded corners
  alignItems: 'center', // Center the text inside the button
  justifyContent: 'center',
  shadowColor: '#000', // Subtle shadow effect
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 5, // Shadow effect for Android
  transition: 'background-color 0.3s ease', // Smooth background change transition
  alignSelf: 'flex-start',
  marginRight:15, // Align the button to the left side
},
editButtonText: {
  fontSize: 16,
  color: '#fff',
  fontWeight: '500', // Lighter weight for the text for better readability
},
saveButtonText: {
  fontSize: 16,
  color: '#fff',
  fontWeight: 'bold', // Stronger text weight for a more prominent "Save" button
},


  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePictureText: {
    marginTop: 8,
    color: '#007bff',
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  logoutButton: {
    marginTop: 10,  // Reduced the margin to bring it 
    marginBottom: 50,
    paddingVertical: 5, 
    paddingHorizontal: '15%', // Keep horizontal padding the same for better responsiveness
    backgroundColor: '#dc3545', 
    borderRadius: 4, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, 
  },
 contactus: {
    marginBottom: 50,
    paddingVertical: 10, // Slightly increased for better clickability
    paddingHorizontal: '20%', // Wider for better touch targets
    backgroundColor: '#28a745', // Modern green shade
    borderRadius: 8, // Smooth rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Subtle shadow for a floating effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1, // Adds subtle border for visual depth
    borderColor: '#218838', // Darker shade of green for border
  },
  logoutButtonText: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 25, // Keep the font size fixed for consistency
  },
  
 headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    
  },

  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    elevation: 5,
  },

  menuOption: {
    paddingVertical: 16,  // Increased vertical padding for larger button
    paddingHorizontal: 24, // Added horizontal padding for more space
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10, // Added margin to separate options
  },

  menuText: {
    fontSize: 18,  // Increased font size for better readability
    color: '#333',
  },

});