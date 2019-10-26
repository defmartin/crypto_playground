<template>
  <div class="row">
    <b>SEND TOKEN:</b>
    <br />
    <select v-model="makeTransfer.fromAdr">
      <option
        v-for="identity in identities"
        v-bind:key="identity.address"
        v-bind:value="identity.address"
      >{{identity.address}}</option>
    </select>
    <input v-model="makeTransfer.amount" placeholder="amount" />
    <select v-if="makeTransfer.fromAdr" v-model="makeTransfer.token">
      <option
        v-for="token in currentIdentity.allTokens"
        v-bind:key="token"
        v-bind:value="token"
      >{{_getSymbolfromKey(token)}}</option>
    </select>
    <input v-model="makeTransfer.toAdr" placeholder="toAdr" />
    <button
      v-on:click="sendToken(makeTransfer.fromAdr,makeTransfer.amount,makeTransfer.token,makeTransfer.toAdr)"
    >send</button>

    <br />
  </div>
</template> 

<script>
import { RadixAccount, RadixTransactionBuilder } from "radixdlt";

import moment from "moment";
import { Decimal } from "decimal.js";

export default {
  name: "SendToken",
  props: {
    identities: Array
  },
  data() {
    return {
      makeTransfer: {
        amount: null,
        token: null,
        toAdr: null,
        fromAdr: null
      }
    };
  },
  methods: {
    sendToken(fromAdr, amount_input, token, toAdr) {
      const fromIdentity = this._getIdentity(fromAdr);
      const toAccount = RadixAccount.fromAddress(toAdr, true);
      const balance = new Decimal(
        fromIdentity["balances"][this._getSymbolfromKey(token)]
      );
      const amount = new Decimal(amount_input);

      if (!amount.greaterThan(balance)) {
        const transactionStatus = RadixTransactionBuilder.createTransferAtom(
          fromIdentity["account"],
          toAccount,
          token,
          amount
        ).signAndSubmit(fromIdentity["identity"]);

        transactionStatus.subscribe({
          next: status => {
            // console.log(status);
            // For a valid transaction, this will print, 'FINDING_NODE', 'GENERATING_POW', 'SIGNING', 'STORE', 'STORED'
          },
          complete: () => {
            console.log("Transaction complete");
          },
          error: error => {
            console.error("Error submitting transaction", error);
          }
        });
      } else {
        console.log("insufficient funds");
      }
    },
    _getSymbolfromKey(key) {
      return key.split("/")[2].toString();
    },
    _getIdentity(adr) {
      let ident = null;
      this.identities.map(identity => {
        if (identity.address == adr) {
          ident = identity;
        }
      });
      return ident;
    }
  },
  computed: {
    currentIdentity() {
      if (this.makeTransfer.fromAdr) {
        return this._getIdentity(this.makeTransfer.fromAdr);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
