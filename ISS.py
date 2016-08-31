import urllib2, base64
import json
import time
from ISStreamer.Streamer import Streamer

FEEDS = ['iss-now','astros']
BUCKET_NAME = ":satellite_orbital:ISS Location"
BUCKET_KEY = "isspython"
ACCESS_KEY = "Your_Access_Key"
MINUTES_BETWEEN_READS = 5

# Fetch JSON data from the URL
def get_reading(feed):
	api_reading_url = urllib2.Request("http://api.open-notify.org/" + feed + ".json") 
	print api_reading_url
	try:
	  	f = urllib2.urlopen(api_reading_url)
	except:
		print "Failed to get JSON"
		return False
	json_reading = f.read()
	f.close()
	return json.loads(json_reading)

# Initialize Initial State Streamer
streamer = Streamer(bucket_name=BUCKET_NAME, bucket_key=BUCKET_KEY, access_key=ACCESS_KEY)

# Stream data from the URL(s) every x minutes
while True: 
	for i in FEEDS:
		# Call function for each URL
		readings = get_reading(i)

		if (readings != False):
			# If looking at ISS Position data
			if 'iss_position' in readings:
				latitude = readings['iss_position']['latitude']
				longitude = readings['iss_position']['longitude']
				location = str(latitude) + "," + str(longitude)
				# Stream current ISS coordinates
				streamer.log(":globe_with_meridians:Current Coordinates",location)
				streamer.flush()
			# If looking at people currently on the ISS
			if 'people' in readings:
				number = readings['number']
				# Stream current number of people in space
				streamer.log(":alien:How many people are in space?",str(number))
				streamer.flush()
	# Wait x minutes
	time.sleep(60*MINUTES_BETWEEN_READS)
