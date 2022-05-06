/*
	Attendance Automation
    Copyright (C) 2022 Jason Lines

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const fs = require('fs');
const moment = require('moment');
const parse = require('csv-parse/lib/sync');
const { exec } = require("child_process");

let runCommand = (command) => { 

	exec(command, (error, stdout, stderr) => {
	    if (error) {
	        console.log(`error: ${error.message}`);
	        return;
	    }
	    if (stderr) {
	        console.log(`stderr: ${stderr}`);
	        return;
	    }
	    console.log(`stdout: ${stdout}`);
	});
}

//this will convert a class name to a class id, the website identifies each class by its id number
//'123456' is a place holder and needs to updated to the correct class id
let classLookup = (className) => {
	if(className.toLowerCase().indexOf('english') >= 0) {
		return 123456;
	}

	if(className.toLowerCase().indexOf('science') >= 0) {
		return 123456;
	}

	if(className.toLowerCase().indexOf('history') >= 0) {
		return 123456;
	}
}

//these are session values that the server uses to identify who is logged in, 
//the correct values can be retrieved from a browser that is logged in
let sisCookie = "SISCOOKIE";
let jsession = "JSESSIONID";
let xsfr = "XSFR";

//student and parent identifiers
let parentName = "Parent+Name";
//this is not the same as the student's login id and can be found in the URL of the attendance page
let personId = "1234567";

//not sure what this is but it needs to be there
let did143 = "b6ef9d56-f916-4612-98f9-a76a0ec6bd5b";


//read the CSV file and generate urls for attendance submission
let csv = fs.readFileSync('./times.csv', {encoding:'utf8'});
let data = parse(csv, {
	columns:true,
	skip_empty_lines:true
});
data.forEach((item) => {

	let dateString = moment(item['date']).format('MM/DD/YYYY');
	let classId = classLookup(item['class']);

	//This is the actual command that can is run to submit the attendance information
	let command = `curl -X POST -H 'Content-Type: application/x-www-form-urlencoded' -d 'submittedDate=${encodeURIComponent(dateString)}&hours=${item.hours}&minutes=${item.minutes}&class=${classId}&reallySubmit=yes&contextID=${personId}&contextIDType=userID&personID=${personId}&guardian=${parentName}&guardianApproved=Yes' -b '_did1432334727=${did143};tool=;selection=;portalApp=student;lang=en;JSESSIONID=${jsession};XSFR-TOKEN=${xsfr};portalLang=en;appName=chandler;sis-cookie=${sisCookie}' https://chandleraz.infinitecampus.org/campus/services/coaAttendance.jsp`;


	console.log(command);

	//enable the following line to automatically call the generated urls
	//runCommand(command);
})