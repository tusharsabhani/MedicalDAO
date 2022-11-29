import Head from 'next/head';
import { BigNumber, Contract, providers, utils } from "ethers";
import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import {REQUEST_CONTRACT_ADDRESS, REQUEST_ABI} from "../constants";

export default function Home() {

  const zero = BigNumber.from(0);
  const [requests, setRequests] = useState([]);
  const [numberOfRequests, setNumberOfRequests] = useState("0");
  const [walletConnected, setWalletConnected] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(zero);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("Home");
  const [amountToBeDonated, setAmountToBeDonated] = useState("0");
  const web3ModalRef = useRef();  

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  useEffect(() => {
    if (page === "Donate") {
      getNumberOfRequests();
      fetchAll();
    }
  }, [page]);

  const connectWallet = async () => {
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
    }catch(error){
      console.error(error);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const fetchRequestsById = async (id) => {
    try{
      const provider = await getProviderOrSigner();
      const reqContract = getDaoContract(provider);
      const requests = await reqContract.requestDetails(id);
      const fetchedRequest = {
        requestId : id + 1,
        hospitalName: requests.hospitalName.toString(), 
        country: requests.country.toString(),
        city: requests.city.toString(),
        emailId: requests.emailId.toString(),
        amount: requests.amount.toString(),
        description: requests.description.toString(),
        isActive: requests.isActive,
        address: requests.requester.toString(),
      };
      return fetchedRequest;
    }catch(error){
      console.error(error);
    }
  };

  const fetchAll = async () => {
    try{
      const requests = [];
      for(let i = 0; i < numberOfRequests; i++){
        const request = await fetchRequestsById(i);
        requests.push(request);
      }
      setRequests(requests);
    }catch(error){
      console.error(error);
    }
  };

  const submit = async () => {
    try{
      setLoading(true);
      const signer  = await getProviderOrSigner(true);
      const reqContract = getDaoContract(signer);
      console.log(reqContract);
      const txn = await reqContract.saveRequestDetails(hospitalName, city, country, email, amount, description);
      await txn.wait();
      await getNumberOfRequests();
      setLoading(false);
    }catch(error){
      console.error(error);
    }
  };

  const getDaoContract = (providerOrSigner) => {
    return new Contract(
      REQUEST_CONTRACT_ADDRESS,
      REQUEST_ABI,
      providerOrSigner
    );
  };

  const getNumberOfRequests = async () => {
    try{
      const provider = await getProviderOrSigner();
      const reqContract = getDaoContract(provider);
      const num = await reqContract.numRequestDetails();
      setNumberOfRequests(num.toString());
    }catch(error){
      console.error(error);
    }
  };

  const sendEth = async (add, amount) => {
    console.log(add);
    let account = [];
    account = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log(account);
    console.log(amount);
    console.log(amount*(10**18));
    console.log((amount*(10**18)).toString(16));
    //const currentAccount = await ethereum.request({ method: 'eth_requestAccounts' });
    try{
      const ethAmount = utils.parseEther(amount.toString());
      if(!ethAmount.eq(zero)){
        console.error(requests.address);
        ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: account[0],
              to: add,
              value: (amount*(10**18)).toString(16),
            },
          ],
        })
        
      }
    }catch(error){
      console.error(error);
    }
  };

  function renderRequest(){
    if(loading){
      return(<div class="w-full h-auto block h-screen  p-4 flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">UPLOADING REQUEST!</div>)
    }else{
      return(
        <div class="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 pt-[10vh]">
          <div class="w-full h-auto block h-screen  p-4 flex items-center justify-center">
      <div class="bg-white py-6 px-10 sm:max-w-md w-full ">
          <div class="sm:text-3xl text-2xl font-semibold text-center text-sky-600  mb-12">
              Registration Form 
          </div>
          <div class="">
              <div>
                   <input type="text" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500" placeholder="Hospital/Organisation Name" onChange={(e) => setHospitalName(e.target.value)}/>
              </div>
              <div>
                  <input type="text" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 my-8" placeholder="City" onChange={(e) => setCity(e.target.value)}/>
              </div>
              <div>
                <input type="text" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 mb-8" placeholder="Country" onChange={(e) => setCountry(e.target.value)}/>
              </div>
              <div>
                <input type="email" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 mb-8" placeholder="Email" onChange={(e) => setEmail(e.target.value)}/>
              </div>
              <div>
                <input type="number" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 mb-8" placeholder="Amount(in Ether)" onChange={(e) => setAmount(e.target.value)}/>
              </div>
        <div>
                <textarea type="text" class="focus:outline-none border-b w-full pb-2 border-sky-400 placeholder-gray-500 mb-8" placeholder="Description" onChange={(e) => setDescription(e.target.value)}/>
              </div>
              <div class="flex justify-center my-6">
                  <button class=" rounded-full  p-3 w-full sm:w-56 bg-gradient-to-r from-sky-600  to-teal-300 text-white text-lg font-semibold" onClick={submit}>
                      Submit
                  </button>
              </div>
          </div>
      </div>
  </div>
        </div>
      )
    }
  }

  function renderDonate(){
    if(requests.length === 0){
      return(
        <div class="w-full h-auto block h-screen  p-4 flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100"> 
          <p>No Requests at the moment. Come back later to help!</p>
        </div>
      )
    }else{
      return(
        <div class="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
          <p class="pt-20 px-20 text-2xl">Donate from the list of following requests</p>
          <div class="grid grid-cols-3">
            {requests.map((p, i) =>(
              //NEED CLASS FOR CARDS
              <div key={i} class="p-4 flex-col items-center justify-center px-20 text-lg box-border">
                <p>Request Id: {p.requestId}</p>
                <p>Hospital Name: {p.hospitalName}</p>
                <p>Country: {p.country}</p>
                <p>City: {p.city}</p>
                <p>Email : {p.emailId}</p>
                <p>Donation Required: {p.amount}</p>
                <p>Description: {p.description}</p>
                {p.isActive ? (
                  <div>
                    <input type="number" class="pl-2 focus:outline-none border-b w-50 border-sky-400 placeholder-gray-500" placeholder="Enter amount to donate" onChange={(e) => setAmountToBeDonated(e.target.value)}/>
                    <button class="px-2 rounded-full bg-gradient-to-r w-22 ml-5 from-sky-600  to-teal-400 text-white text-lg font-semibold" onClick={() => sendEth(p.address, amountToBeDonated)}>DONATE</button>
                  </div>
                ) : (<div>Mission Successful!!! No more donations needed.</div>) 
              }
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  function renderVote(){
    return(
      <div class="w-full h-auto block h-screen p-4 flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
        <p>VOTE!</p>
      </div>
    )
  }

  function renderHome(){
    return(
      <div class="w-full h-auto p-4 flex items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 flex-col space-y-16 pt-[15vh]">
        <div>
          <p class="font-bold text-4xl">Welcome to MedicalHelpDAO</p>
        </div>
        <div>
          <img src='./hospital.jpg'></img>
        </div>
        <div>
          <p class="text-xl">Help hospitals worldwide from anywhere in the world</p>
        </div>
        <div>
        <p class="text-2xl font-semibold">Features we offer:</p>
        <p class="text-xl">1. Request ether for resources (only hospitals/clinics can)</p>
        <p class="text-xl">2. Donate ether to help out a hospital (anyone can donate)</p>
        </div>
      </div>
    )
  }

  //open appropriate page
  function openTab(){
    if(page === "Home"){
      return renderHome();
    }else if(page === "Request"){
      return renderRequest();
    }else if(page === "Donate"){
      return renderDonate();
    }else if(page === "Vote"){
      return renderVote();
    }
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main} class="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 pb-10">
        <nav class="px-4 py-3 bg-black text-white flex justify-end fixed w-full top-0">
          <ul class="pl-28 py-1 flex space-x-11">
              <li class="cursor-pointer" onClick={() => setPage("Home")}>Home</li>
              <li class="cursor-pointer" onClick={() => setPage("Request")}>Request</li>
              <li class="cursor-pointer" onClick={() => setPage("Donate")}>Donate</li>
              <li class="cursor-pointer" onClick={() => setPage("Vote")}>Vote</li>
              <button class="bg-purple-400 rounded-lg text-white px-4 py-1 font-semibold" onClick={connectWallet}>Connect Wallet</button>
          </ul>
        </nav>
        <div>
          {openTab()}
        </div>

        

      </main>

      <hr class="bg-black h-0.5 "></hr>

      <footer class="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-center pt-7 pb-3 font-semibold">
        <p>Made by Varun & Tushar</p>
      </footer>
    </div>
  )
}
