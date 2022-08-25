class QueueScheduler {
  constructor(queue_function){
    this.queue_function = queue_function
    this.queue_timeout = null
    this.queue_time = -1
  }

  queueFinished(){
    if (this.queue_function){
      this.queue_function(this);
    }
  }

  setQueueTime(time){
    this.queue_time = new Date().getTime() + time * 1000;
    this.queue_timeout = setTimeout(()=>{
      this.clearQueueTime()
      this.queueFinished()
    }, time*1000)
  }

  clearQueueTime(){
    if (this.queue_timeout) {
      clearTimeout(this.queue_timeout)
    }
    this.queue_time = -1
  }

  forceQueueNext(){
    if (this.queue_timeout) {
      this.clearQueueTime()
      this.queueFinished()
    }
  }
}

module.exports = QueueScheduler;