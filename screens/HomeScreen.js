import { View, Text, SafeAreaView, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { theme } from '../theme'
import {debounce} from 'lodash'
import{fetchLocations, fetchWeatherForcast} from '../api/weather'

import {CalendarDaysIcon, MagnifyingGlassIcon} from 'react-native-heroicons/outline'
import {MapPinIcon} from 'react-native-heroicons/solid'
import { weatherImage } from '../constants'
import * as Progress from 'react-native-progress';
import { getData, storeData } from '../utils/asyncStorage'


export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false)
  const [locations, setLocations] = useState([])
  const [weather, setWeather] = useState({})
  const[loading, setLoading] = useState('true')

  

  const handleLocation = (loc) =>{
    setLoading(true)
    setLocations([])
    toggleSearch(false)
    fetchWeatherForcast({
      cityName: loc.name +"," + loc.country,
      days: '7'
    }).then(data=>{
      setWeather(data)
      setLoading(false)
      storeData('city', loc.name +"," + loc.country)
    })
  }

  const handleSearch = value =>{
    //Fetch Locations
    if(value.length > 2){
      fetchLocations({cityName : value}).then(data =>{
        setLocations(data)
      })
    }
  }

  useEffect(()=>{
    fetchMyWeatherData()
  }, [])

  const fetchMyWeatherData = async ()=>{
    let myCity = await getData('city');
    let cityName = 'London, United Kingdom'
    if(myCity) cityName = myCity
    fetchWeatherForcast({
      cityName: cityName,
      days: '7'
    }).then(data =>{
      setWeather(data)
      setLoading(false)
    })
  }

  const handleTextBounce = useCallback(debounce(handleSearch, 500), [])

  const {current, location} = weather;

  return (
    <View className = "flex-1 relative bg-black">
      <StatusBar style='light' />
      <Image source = {require('../assets/images/bg.png')} className = "absolute h-full w-full opacity-50"/>
      {
        
        loading? (
          <View className="flex-1 flex-row justify-center items-center">
            <Progress.CircleSnail thickness={10} size={140} color={'#F4C430'}/>
          </View>
        ):(
          <SafeAreaView className = "mt-10 flex flex-1">

          {/* Search Section */}
          <View style = {{height : '7%'}} className = "mx-4 relative z-50">
              <View className = "flex-row justify-end items-center rounded-full"
                style = {{backgroundColor : showSearch ? theme.bgWhite(0.2) : 'transparent'}}>
                  {
                    showSearch ? (
                    <TextInput
                    onChangeText={handleTextBounce}
                      placeholder='Search city' placeholderTextColor={'lightgray'}
                      className = "pl-6 pb-1 h-10 flex-1 text-base text-white"
                    />) : null
  
                  }
                  <TouchableOpacity
                    onPress={()=>toggleSearch(!showSearch)}
                    style = {{backgroundColor : theme.bgWhite(0.3) }}
                    className = "rounded-full p-3 m-1 ">
  
                      <MagnifyingGlassIcon size = "25" color={'white'}/>
                  </TouchableOpacity>
              </View>
  
              {
                locations.length > 0 && showSearch ? (
                  <View className = "absolute w-full bg-gray-300 top-16 rounded-3xl"> 
                    {
                      locations.map((loc, index) =>{
                        let showBorder = (index+1 != locations.length)
                        return(
                          <TouchableOpacity
                          onPress={()=>handleLocation(loc)}
                            key = {index}
                            className = {showBorder ? "flex-row items-center border-0 p-3 px-4 mb-1 border-b-2 border-b-gray-500" : "flex-row items-center border-0 p-3 px-4 mb-1"}
                          >
                            <MapPinIcon size={20} color={'gray'}></MapPinIcon>
                            <Text
                              className = "text-black ml-2 text-lg"
                            >{loc?.name}, {loc?.country}</Text>
                          </TouchableOpacity>
                        )
                      })
                    }
                  </View>
                ):null
              }
          </View>
  
  
          {/* Forcast section */}
          <View className="mx-4 flex justify-around flex-1 mb-2">
            {/* Location */}
            <Text className= "text-white text-center text-2xl font-bold">
              {location?.name},  
              <Text className = "text-lg font-semibold text-gray-300">
                {" " + location?.country}
              </Text>
            </Text>
  
            {/* Weather Image */}
              <View className = "flex-row justify-center">
                <Image 
                  source={weatherImage[current?.condition?.text]} className = "w-52 h-52"
                />
              </View>
  
            {/* Degree Celcius */}
            <View className = "space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center font-bold text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>
  
            {/* Other stats */}
  
            <View className="flex-row justify-between mx-4"> 
              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/images/Wind.png")} className = "w-6 h-6"/>
                <Text className="text-white font-semibold text-base">
                  {current?.wind_kph}km
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/images/Drop.png")} className = "w-6 h-6"/>
                <Text className="text-white font-semibold text-base">
                  {current?.humidity}%
                </Text>
              </View>
              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/images/Sun.png")} className = "w-6 h-6"/>
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
  
            {/* Forcast for next days */}
            <View className="mb-2 space-y-3 -ml-5 -mr-5">
              <View className="flex-row items-center mx-5 space-x-2">
                <CalendarDaysIcon size="22" color="white" />
                <Text className="text-white text-base">Daily forcast</Text>
              </View>
  
              <ScrollView
                horizontal
                contentContainerStyle={{paddingHorizontal: 15}}
                showsHorizontalScrollIndicator={false}
              >
  
                {
                  weather?.forecast?.forecastday?.map((item, index)=>{
                  let date = new Date(item.date);
                  let options = {weekday : 'long'}
                  let dayName = date.toLocaleDateString('en-US', options)
                  dayName = dayName.split(',')[0]
                  return(
                    <View 
                      className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                      style={{backgroundColor: theme.bgWhite(0.15)}}>
                      <Image source={weatherImage[item?.day?.condition?.text]} className="h-11 w-11"/>
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">{item?.day?.avgtemp_c}&#176;</Text>
                    </View>)
                  })
                }
                
  
  
              </ScrollView>
            </View>
  
          </View>
          </SafeAreaView>
        )
      }


    </View>
  )

  
}

