<template>
  <div class="row" v-if="data.account">
    <ul>
      <b>MY ADR:</b>
      <li>{{data.account.address }}</li>
    </ul>

    <ul>
      <b>BALANCES:</b>
      <li v-for="(value, key) in data.balances" v-bind:key="key">{{ key }}: {{ value }}</li>
    </ul>

    <ul>
      <b>TRANSACTIONS:</b>
      <li
        v-for="(transaction, aid) in data.transactions"
        v-bind:key="aid"
      >{{transaction.timestamp}} # {{ transaction.value }} {{ transaction.token }}</li>
    </ul>

    <ul>
      <b>MESSAGES:</b>
      <li v-for="(message, aid) in data.messages" v-bind:key="aid">{{message}}</li>
    </ul>
  </div>
</template> 

<script>
import moment from "moment";
import { Decimal } from "decimal.js";

export default {
  name: "ShowAccounts",
  props: {
    data: Object
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
