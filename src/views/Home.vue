<template>
  <div class="home">
    <button v-on:click="createIdentity">CREATE identity</button>
    <ShowAccounts v-for="(value, key) in identities" v-bind:key="key" v-bind:data="value" />

    <br /><br />

    <button v-if="!buttonSendToken" v-on:click="changeStatus('buttonSendToken')">show send token</button>
    <SendToken v-if="buttonSendToken" v-bind:identities="identities" />
    <br /><br />
    <button
      v-if="!buttonCreateToken"
      v-on:click="changeStatus('buttonCreateToken')"
    >show create token</button>
    <CreateToken v-if="buttonCreateToken" v-bind:identities="identities" />
    <br />
    <br />
    <button
      v-if="!buttonBurnTokens"
      v-on:click="changeStatus('buttonBurnTokens')"
    >show burn tokens</button>
    <BurnTokens v-if="buttonBurnTokens" v-bind:identities="identities" />
    <br />
    <!-- <button v-if="account['me']" v-on:click="recreateIdentity('me')">recreate me</button>
    <br />
    <button v-if="account['friend']" v-on:click="recreateIdentity('friend')">recreate friend</button>-->
  </div>
</template>

<script>
import {
  radixUniverse,
  RadixUniverse,
  RadixKeyStore,
  RadixSimpleIdentity,
  RadixIdentityManager
} from "radixdlt";

import moment from "moment";
import { Decimal } from "decimal.js";

// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import SendToken from "@/components/SendToken.vue";
import CreateToken from "@/components/CreateToken.vue";
import ShowAccounts from "@/components/ShowAccounts.vue";
import BurnTokens from "@/components/BurnTokens.vue";

export default {
  name: "home",
  components: {
    HelloWorld,
    SendToken,
    CreateToken,
    ShowAccounts,
    BurnTokens
  },
  data() {
    return {
      identities: [],
      buttonSendToken: false,
      buttonCreateToken: false,
      buttonBurnTokens: false
    };
  },
  methods: {
    loadIdentity(key) {
      return new Promise((resolve, reject) => {
        // NOTE: This is insecure, normally you would ask the user for a password
        const password = "SuperDuperSecretPassword";
        const identityManager = new RadixIdentityManager();

        if (!localStorage["keystore_" + key]) {
          // Generate a new random identity
          const identity = identityManager.generateSimpleIdentity();
          RadixKeyStore.encryptKey(identity.address, password)
            .then(encryptedKey => {
              localStorage["keystore_" + key] = JSON.stringify(encryptedKey);
              console.log("Encrypted private key stored in localstorage");
            })
            .catch(error => {
              console.error("Error encrypting private key", error);
            });
          resolve(identity);
        } else {
          // Load identity from localstorage
          const encryptedKey = JSON.parse(localStorage["keystore_" + key]);
          RadixKeyStore.decryptKey(encryptedKey, password)
            .then(address => {
              const identity = new RadixSimpleIdentity(address);
              return resolve(identity);
            })
            .catch(error => {
              console.error("Error decrypting private key", error);
            });
        }
      });
    },
    loadIdentity2(identityNr) {
      return new Promise((resolve, reject) => {
        // NOTE: This is insecure, normally you would ask the user for a password
        const password = "SuperDuperSecretPassword";
        const identityManager = new RadixIdentityManager();

        if (!localStorage["keystore_" + identityNr]) {
          // Generate a new random identity
          const identity = identityManager.generateSimpleIdentity();
          RadixKeyStore.encryptKey(identity.address, password)
            .then(encryptedKey => {
              localStorage["keystore_" + identityNr] = JSON.stringify(
                encryptedKey
              );
              console.log("Encrypted private key stored in localstorage");
            })
            .catch(error => {
              console.error("Error encrypting private key", error);
            });
          resolve(identity);
        } else {
          // Load identity from localstorage
          const encryptedKey = JSON.parse(
            localStorage["keystore_" + identityNr]
          );
          RadixKeyStore.decryptKey(encryptedKey, password)
            .then(address => {
              const identity = new RadixSimpleIdentity(address);
              return resolve(identity);
            })
            .catch(error => {
              console.error("Error decrypting private key", error);
            });
        }
      });
    },
    createIdentity() {
      const identityNr = this.identities.length + 1;

      this.loadIdentity2(identityNr).then(identity => {
        let identityDict = {
          identity: identity,
          account: identity.account,
          address: identity.account.getAddress(),
          messages: [],
          balances: {},
          transactions: [],
          allTokens: null
        };
        identity.account.openNodeConnection();
        console.log("My account address: ", identityDict["address"]);

        this.identities.push(identityDict);

        this.subscribeAllMessageHistory(identityDict);
        this.subscribeAllTransactionHistory(identityDict);
        this.subscribeBalanceUpdates(identityDict);
      });
    },
    recreateIdentity(identityNr) {
      localStorage.removeItem("keystore_" + identityNr);
      this.createIdentity(identityNr);
    },
    subscribeBalanceUpdates(identityDict) {
      identityDict["account"].transferSystem
        .getTokenUnitsBalanceUpdates()
        .subscribe(balance => {
          const allKeys = Object.keys(balance);

          identityDict["allTokens"] = allKeys;

          allKeys.map(key => {
            const token = key.split("/")[2];
            const curBalance = balance[key.toString()].toString();
            this.$set(identityDict["balances"], token, curBalance);
          });
        });
    },
    subscribeAllTransactionHistory(identityDict) {
      identityDict["account"].transferSystem
        .getAllTransactions()
        .subscribe(transactionUpdate => {
          //   console.log(transactionUpdate.transaction);

          const allKeys = Object.keys(
            transactionUpdate.transaction.tokenUnitsBalance
          );

          allKeys.map(key => {
            const token = key.split("/")[2];
            const curValue = transactionUpdate.transaction.tokenUnitsBalance[
              key.toString()
            ].toString();
            //   this.$set(this.transactions,token,curValue)s

            const timestampString = moment(
              transactionUpdate.transaction.timestamp
            ).format("DD.MM.YY H:mm:ss");
            identityDict["transactions"].push({
              aid: transactionUpdate.transaction.aid,
              timestamp: timestampString,
              token: token,
              value: curValue
            });
            //   console.log("balance is: " + curBalance + " " + token);
          });

          //   console.log(this.transactions[who]);
        });
    },
    subscribeAllMessageHistory(identityDict) {
      identityDict["account"].messagingSystem
        .getAllMessages()
        .subscribe(data => {
          identityDict["messages"].push(data.message.content);
        });
    },
    changeStatus(button) {
      if (button == "buttonCreateToken") {
        this.buttonCreateToken = !this.buttonCreateToken;
      }
      if (button == "buttonSendToken") {
        this.buttonSendToken = !this.buttonSendToken;
      }
      if (button == "buttonBurnTokens") {
        this.buttonBurnTokens = !this.buttonBurnTokens;
      }
    }
  },
  created() {
    // Bootstrap the universe
    radixUniverse.bootstrap(RadixUniverse.BETANET_EMULATOR);
  }
};
</script>
