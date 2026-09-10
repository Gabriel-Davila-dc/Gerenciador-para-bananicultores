/**
 * A API mora sempre na mesma máquina que serve o front, na porta 3333.
 *
 * O endereço é montado a partir de onde a página foi aberta: no PC vira
 * localhost, e no celular vira o IP da máquina na rede. Fixar "localhost"
 * aqui quebraria o acesso pelo celular, porque lá localhost é o próprio
 * aparelho - e é no celular que o app vai ser usado de verdade.
 */
export const environment = {
  production: false,
  apiUrl: `http://${window.location.hostname}:3333`,
};
