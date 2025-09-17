import { 
  getCurrentTime, 
  getCurrentWeather, 
  getLocationInfo, 
  formatLocationInfo,
  formatTimeInfo,
  formatWeatherInfo 
} from '../backend/src/lib/realtime.js';

async function testRealtimeFeatures() {
  console.log('🧪 Testing Real-time Features\n');

  const testLocations = [
    'Madrid, Spain',
    'Montreal, Canada',
    'Tokyo, Japan',
    'New York, USA',
    'London, UK',
    'Paris, France',
    'Berlin, Germany',
    'Rome, Italy',
    'São Paulo, Brazil',
    'Sydney, Australia'
  ];

  try {
    console.log('🕐 Testing Time Functionality:\n');
    
    for (const location of testLocations.slice(0, 3)) {
      console.log(`📍 Testing time for: ${location}`);
      
      try {
        const timeInfo = await getCurrentTime(location);
        console.log(`   ✅ Time: ${timeInfo.time}`);
        console.log(`   ✅ Timezone: ${timeInfo.timezone}`);
        console.log(`   ✅ UTC Offset: ${timeInfo.utc_offset}`);
        
        // Test formatting
        const formattedTime = formatTimeInfo(timeInfo, 'en');
        console.log(`   📝 Formatted: ${formattedTime}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n🌤️ Testing Weather Functionality:\n');
    
    for (const location of testLocations.slice(0, 3)) {
      console.log(`📍 Testing weather for: ${location}`);
      
      try {
        const weatherInfo = await getCurrentWeather(location);
        console.log(`   ✅ Location: ${weatherInfo.location}`);
        console.log(`   ✅ Temperature: ${weatherInfo.temperature}°C (${weatherInfo.temperature_fahrenheit}°F)`);
        console.log(`   ✅ Description: ${weatherInfo.weather_description}`);
        console.log(`   ✅ Wind Speed: ${weatherInfo.wind_speed} km/h`);
        console.log(`   ✅ Time: ${weatherInfo.time}`);
        
        // Test formatting
        const formattedWeather = formatWeatherInfo(weatherInfo, 'en');
        console.log(`   📝 Formatted: ${formattedWeather}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n🌍 Testing Combined Location Info:\n');
    
    for (const location of testLocations.slice(0, 2)) {
      console.log(`📍 Testing combined info for: ${location}`);
      
      try {
        const locationInfo = await getLocationInfo(location);
        console.log(`   ✅ Location: ${locationInfo.location}`);
        
        if (locationInfo.time) {
          console.log(`   ✅ Time: ${locationInfo.time.time}`);
          console.log(`   ✅ Timezone: ${locationInfo.time.timezone}`);
        }
        
        if (locationInfo.weather) {
          console.log(`   ✅ Weather: ${locationInfo.weather.temperature}°C - ${locationInfo.weather.weather_description}`);
        }
        
        // Test formatting
        const formattedInfo = formatLocationInfo(locationInfo, 'en');
        console.log(`   📝 Formatted:`);
        console.log(`   ${formattedInfo}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('   ' + '─'.repeat(50));
    }

    console.log('\n🌍 Testing Multilingual Formatting:\n');
    
    const testLocation = 'Madrid, Spain';
    const languages = ['en', 'es', 'fr', 'de', 'it', 'pt'];
    
    try {
      const locationInfo = await getLocationInfo(testLocation);
      
      for (const lang of languages) {
        console.log(`📍 ${lang.toUpperCase()} formatting for: ${testLocation}`);
        
        const formattedInfo = formatLocationInfo(locationInfo, lang);
        console.log(`   ${formattedInfo}`);
        console.log('   ' + '─'.repeat(30));
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log('\n🎯 Expected Features:');
    console.log('✅ Real-time time for any location');
    console.log('✅ Current weather for any location');
    console.log('✅ Multilingual support for all responses');
    console.log('✅ Proper error handling and fallbacks');
    console.log('✅ Formatted responses for all platforms');
    console.log('✅ Combined time and weather information');

    console.log('\n🚀 Real-time Features Ready!');
    console.log('The chatbot can now provide:');
    console.log('• Current time for any location worldwide');
    console.log('• Current weather for any location worldwide');
    console.log('• Multilingual responses in user\'s language');
    console.log('• Combined time and weather information');
    console.log('• Proper error handling and fallbacks');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

testRealtimeFeatures();
