<template>
    <div>
        <button @click="send">send</button>
    </div>
</template>
<script>
import axios from "axios";
// 添加请求拦截器
axios.interceptors.request.use(
    function (config) {
        // alert(11)
        console.log("interceptors.request");
        // 在发送请求之前做些什么
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);
axios.interceptors.request.use(
    function (config) {
        // alert(22)
        console.log("interceptors.request222");
        // 在发送请求之前做些什么
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
axios.interceptors.response.use(
    function (response) {
        console.log("interceptors.response");
        // 对响应数据做点什么
        return response;
    },
    function (error) {
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    function (response) {
        console.log("interceptors.response22212");
        // 对响应数据做点什么
        return response;
    },
    function (error) {
        // 对响应错误做点什么
        return Promise.reject(error);
    }
);
export default {
    methods: {
        send() {
            axios
                .post(
                    "/mock/abc",
                    {
                        firstName: "Fred",
                        lastName: "Flintstone"
                    },
                    {
                        params: {
                            ID: 12345
                        },
                        transformRequest: [this.transformRequest]
                    }
                )
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        transformRequest(data, headers) {
            // debugger
            console.log(data, headers);
            headers.xxxx = "xxxx";
            return data;
        }
    }
};
</script>