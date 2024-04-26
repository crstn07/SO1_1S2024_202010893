<template>
  <div id="app">
    <div class="container">
     <h1 class="text-primary">Logs console - SO1 - 202010893</h1>
     <h4> Fecha, Hora - Mensaje</h4>
      <textarea v-model="logs" class="terminal text-info" id="terminal" name="terminal" rows="20" cols="30" readonly></textarea>
      <button @click="getLogs" :disabled="loading" class="btn btn-success">{{ loading ? 'Obteniendo Logs...' : 'Obtener Logs' }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loading: false,
      logs: ''
    };
  },
  methods: {
    async getLogs() {
      this.loading = true;
      try {
         const response = await fetch('/logs', {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            }
          });
        console.log(response)
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const logs = await response.json();
        console.log(logs)

        let logsText = '';
      
        logs.forEach(log => {
            const date = new Date(log.fecha);
            logsText += `> ${date.toLocaleString()} - ${log.mensaje} \n`;
        });
        this.logs = logsText;
      } catch (error) {
        console.error(error);
        // Handle error
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>