import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {WhiteButton, Img} from 'components/WhiteButton';

export const Connecting = ({navigation}: {navigation: any}) => {
  return (
    <View
      style={{
        flexDirection: 'column',
        alignItems: 'center',
      }}>
      <Text style={styles.title}>Connecting</Text>
      <Text style={styles.description}>
        Connect if you want to receive cryptocurrency by phone number, email or
        twitter.
      </Text>
      <View style={{width: '100%', alignItems: 'center', marginTop: 30}}>
        <WhiteButton
          text={'Connect phone number'}
          height={50}
          img={Img.Phone}
          width="90%"
          onPress={() => navigation.navigate('EditPhoneNumber')}
        />
        <View style={{marginTop: 20, width: '90%'}}>
          <WhiteButton
            text={'Connect email'}
            img={Img.Email}
            height={50}
            onPress={() => navigation.navigate('EditEmail')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    width: '90%',
    marginTop: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
