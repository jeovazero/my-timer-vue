const URL_GOOGLE_SCRIPT ="https://script.google.com/macros/s/AKfycbyd5AcbAnWi2Yn0xhFRbyzS4qMq1VucMVgVvhul5XqS9HkAyJY/exec?tz=America/Fortaleza"

const secondsInMilli = 1000 // 1000 milliseconds
const minutesInMilli = 60 * secondsInMilli
const hoursInMilli = 60 * minutesInMilli
const daysInMilli = 24 * hoursInMilli

const fillNumber = (len, number) => (new Array(len).fill('0').join('') + number).slice(-len)
const fillNumberWidth2 = (number) => fillNumber(2, number)

const decodeMilliseconds = (ms) => {
    const days = Math.trunc(ms / daysInMilli)
    const hours = fillNumberWidth2(Math.trunc((ms % daysInMilli ) / hoursInMilli))
    const minutes = fillNumberWidth2(Math.trunc((ms % hoursInMilli) / minutesInMilli))
    const seconds = fillNumberWidth2(Math.trunc((ms % minutesInMilli) / secondsInMilli))
    return {
      days,
      hours,
      minutes,
      seconds
    }
}

async function getTimeJson(){
    try{
        const response = await fetch(URL_GOOGLE_SCRIPT);
        const json = await response.json();
        console.log(json);
        return json;
    }catch(e){
        console.log(e);
        return e;
    }
};

Vue.component('boxtimer', {
    props: ['number', 'label'],
    template: `<div class="bt">
                <div class="ctn"> {{ number }} </div>
                <div class="lbl"> {{ label }} </div>
            </div>`
});

Vue.component('relogin', {
    props: ['enddate', 'onfinish'],
    data: function(){
        return {
            startDate: Date.now(),
            endDate: Date.now(),
            diffDate: decodeMilliseconds(new Date().getTime()),
            counterHandler: null,
            isRunCounter: true
        }
    },
    template: `
        <div class="relogin">
            <div v-if="isRunCounter" class="timer">
                <boxtimer :number="diffDate.days" label="dias"></boxtimer>
                <div class="spt"></div>
                <boxtimer :number="diffDate.hours" label="horas"></boxtimer>
                <div class="spt"></div>
                <boxtimer :number="diffDate.minutes" label="minutos"></boxtimer>
                <div class="spt"></div>
                <boxtimer :number="diffDate.seconds" label="segundos"></boxtimer>
            </div>
            <div class="new-year" v-else>
                <span>Feliz Ano Novo!!!<br> 🎊 ✨ 🎉</span>
            </div>
        </div>
    `,
    mounted: function(){
        this.startDate = Date.now()
        this.endDate = new Date(this.enddate)

        // Updating the startDate with google date
        getTimeJson().then( o => {
            this.startDate = new Date(o.fulldate)
        }).catch(e => {
            console.log(e)
        });

        if(this.updateDiffDate()){
            this.counterHandler = setInterval( () => {
                this.startDate = Date.now()
                if(!this.updateDiffDate()){
                    clearInterval(this.counterHandler);
                    this.isRunCounter = false;
                    this.onfinish && this.onfinish();
                }
            },1000);
        }else{
            this.onfinish && this.onfinish();
            this.isRunCounter = false;
        }

    },
    methods: {
        updateDiffDate: function(){
            let diff = this.endDate - this.startDate;
            this.diffDate = decodeMilliseconds(Math.max(diff, 0));
            return (diff <= 0) ? false : true;
        }
    }
});

const App = new Vue({
    el: '#root',
    data: {
        finish: true
    },
    methods: {
        hideTitle: function(){
            this.finish = false;
        }
    }
});