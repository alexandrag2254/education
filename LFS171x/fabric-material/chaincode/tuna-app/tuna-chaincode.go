/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Sample Chaincode based on Demonstrated Scenario
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define Tuna structure, with 6 properties.  Structure tags are used by encoding/json library
type Tuna struct {
	Id   string `json:"id"`
	Vessel string `json:"vessel"`
	Timestamp string `json:"timestamp"`
	Longitude  string `json:"longitude"`
	Latitude string `json:"latitude"`
	Holder  string `json:"holder"`
}

/*
 * The Init method is called when the Smart Contract "tuna-chaincode" is instantiated by the Fabric network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called when an application requests to run the Smart Contract "tuna-chaincode"
 * The application also specifies the particular smart contract function to call with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "queryTuna" {
		return s.queryTuna(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "recordTuna" {
		return s.recordTuna(APIstub, args)
	} else if function == "queryAllTuna" {
		return s.queryAllTuna(APIstub)
	} else if function == "changeTunaHolder" {
		return s.changeTunaHolder(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryTuna(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	tunaAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(tunaAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	tuna := []Tuna{
		Tuna{Id: "00001", Vessel: "923F", Longitude: "67.0006", Latitude: "-70.5476", Timestamp: "1504054225", Holder: "Miriam"},
		Tuna{Id: "00002", Vessel: "M83T", Longitude: "91.2395", Latitude: "-49.4594", Timestamp: "1504057825", Holder: "Dave"},
		Tuna{Id: "00003", Vessel: "T012", Longitude: "58.0148", Latitude: "59.01391", Timestamp: "1493517025", Holder: "Igor"},
		Tuna{Id: "00004", Vessel: "P490", Longitude: "-45.0945", Latitude: "0.7949", Timestamp: "1496105425", Holder: "Amalea"},
		Tuna{Id: "00005", Vessel: "S439", Longitude: "-107.6043", Latitude: "19.5003", Timestamp: "1493512301", Holder: "Rafa"},
		Tuna{Id: "00006", Vessel: "J205", Longitude: "-155.2304", Latitude: "-15.8723", Timestamp: "1494117101", Holder: "Shen"},
		Tuna{Id: "00007", Vessel: "S22L", Longitude: "103.8842", Latitude: "22.1277", Timestamp: "1496104301", Holder: "Leila"},
		Tuna{Id: "00008", Vessel: "EI89", Longitude: "-132.3207", Latitude: "-34.0983", Timestamp: "1485066691", Holder: "Yuan"},
		Tuna{Id: "00009", Vessel: "129R", Longitude: "153.0054", Latitude: "12.6429", Timestamp: "1485153091", Holder: "Carlo"},
		Tuna{Id: "00010", Vessel: "49W4", Longitude: "51.9435", Latitude: "8.2735", Timestamp: "1487745091", Holder: "Fatima"},
	}

	i := 0
	for i < len(tuna) {
		fmt.Println("i is ", i)
		tunaAsBytes, _ := json.Marshal(tuna[i])
		APIstub.PutState("TUNA"+strconv.Itoa(i), tunaAsBytes)
		fmt.Println("Added", tuna[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) recordTuna(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	var tuna = Tuna{ Id: args[1], Vessel: args[2], Longitude: args[3], Latitude: args[4], Timestamp: args[5], Holder: args[6]}

	tunaAsBytes, _ := json.Marshal(tuna)
	APIstub.PutState(args[0], tunaAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) queryAllTuna(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "TUNA0"
	endKey := "TUNA999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllTuna:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeTunaHolder(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	tunaAsBytes, _ := APIstub.GetState(args[0])
	tuna := Tuna{}

	json.Unmarshal(tunaAsBytes, &tuna)
	tuna.Holder = args[1]

	tunaAsBytes, _ = json.Marshal(tuna)
	APIstub.PutState(args[0], tunaAsBytes)

	return shim.Success(nil)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}