/*
* @Author: Administrator
* @Date:   2017-07-03 10:18:55
* @Last Modified by:   Administrator
* @Last Modified time: 2017-07-06 18:04:11
*/

;(function ($) {
  $.fn.extend({
    "addressInit": function (AddrObj) {
        // console.log(AddrObj);
    	var isInit_province=false,isInit_city=false,isInit_area=false;
        var data_province,data_city,data_area,data_road;        //数据
        var municipalityArr="重庆市北京市天津市上海市";
        var specialAdd="香港特别行政区澳门特别行政区台湾海外";
        var ismun=false,isspe=false;        //是否是直辖市,特殊区
        var provinceName=AddrObj.province,
            cityName=AddrObj.city,
            areaName=AddrObj.district;
            roadName=AddrObj.road;
        // var provinceName="香港",
        //     cityName="",
        //     areaName="";
        var type=1;     //1,全部初始，2，部分初始
		var defaults={
                "provinceStr":"<option value='0' data-id='0'>—— 省 ——</option>",
                "cityStr":"<option value='0' data-id='0'>—— 市 ——</option>",
                "areaStr":"<option value='0' data-id='0'>—— 区 ——</option>",
                "roadStr":"<option value='0' data-id='0'>—— 街道 ——</option>",
                "countryStr":"<option value='0' data-id='0'>—— 国家 ——</option>"
            };
		var provinceId;
    	//省级联动市级
    	$('#distprovince_id').change(function(){
            var opt=$(this).find("option:selected");
            var id=opt.attr("data-id");
    		provinceId=parseInt(id);
    		var name=opt.text();
    		var cityStr;
    		$('#distcity_id').html(defaults.cityStr);
    		//台湾、香港、澳门、海外
    		if(id=="32"||id=="33"||id=="34"||id=="35"){
    			$('#distcity_id').css('display','inline-block');
    			$('#distarea_id').css('display','none');
				$('#distroad_id').css('display','none');
			//其他
    		}else if(id=="36"){
    			$('#distcity_id').css('display','none');
    			$('#distarea_id').css('display','none');
				$('#distroad_id').css('display','none');
    		}else{
    			$('#distcity_id').css('display','inline-block');
    			$('#distarea_id').css('display','inline-block');
				$('#distroad_id').css('display','inline-block');
    		}
            cityStr=(id==35?defaults.countryStr:defaults.cityStr);
    		if(id=="0"){
    			$('#distcity_id').html(defaults.cityStr);
    		}else if(municipalityArr.indexOf(name)>=0){		//直辖市
    			cityStr=defaults.cityStr+"<option value="+name+" data-id="+id+">"+name+"</option>";
    			$('#distcity_id').html(cityStr);
    		}else{
	    		$.get("/api/district/getSonsById?id="+id+"",function(data){
	    			if(data.state=="success"){
                        cityStr+=handleData(data,1);
		    			$('#distcity_id').html(cityStr);
	    			}else{
	    				alert(data.state);
	    			}
	    		});
    		}
			$('#distarea_id').html(defaults.areaStr);
			$('#distroad_id').html(defaults.roadStr);
    	});
    	//市级联动区级
    	$('#distcity_id').change(function(){
            var opt=$(this).find("option:selected");
            var id=opt.attr("data-id");
    		var areaStr;
    		if(id=="0"){
    			$('#distarea_id').html(defaults.areaStr);
				$('#distroad_id').html(defaults.roadStr);
    			return false;
    		}
    		//特殊地区不再请求
    		if(provinceId>=32&&provinceId<=35){
    			return false;
    		}
    		$.get("/api/district/getSonsById?id="+id+"",function(data){
    			if(data.state=="success"){
    				areaStr=defaults.areaStr+handleData(data,1);
	    			$('#distarea_id').html(areaStr);
    			}else{
    				alert(data.state);
    			}
    		});
			$('#distroad_id').html(defaults.roadStr);
    	});
    	//区级联动街道
    	$('#distarea_id').change(function(){
            var opt=$(this).find("option:selected");
            var id=opt.attr("data-id");
    		var roadStr;
    		if(id=="0"){
				$('#distroad_id').html(defaults.roadStr);
    			return false;
    		}
    		$.get("/api/district/getSonsById?id="+id+"",function(data){
    			if(data.state=="success"){
    				roadStr=defaults.roadStr+handleData(data,1);
	    			$('#distroad_id').html(roadStr);
    			}else{
    				alert(data.state);
    			}
    		});
    	});
    	//数据处理
    	var handleData=function(data,type){
    		var list=[],str;
    		for(var key in data){
				if(key=="referer"){
					break;
				}
                if(type==2){            //部分初始
                    if((data[key].name==provinceName)||(data[key].name==cityName)||(data[key].name==areaName)||(data[key].name==roadName)){
                        str="<option selected value="+data[key].name+" data-id="+data[key].id+">"+data[key].name+"</option>";
                    }else{
                        str="<option value="+data[key].name+" data-id="+data[key].id+">"+data[key].name+"</option>"; 
                    }
                }else{
                    str="<option value="+data[key].name+" data-id="+data[key].id+">"+data[key].name+"</option>"; 
                }
				list.push(str);
			}
			list.pop();
			return list.join('');
    	};
        //测试已有地址方法
        var Test_Func=function(testName){
            var flag=false;
            if(testName===""){
                flag=true;
            }else{
                $.ajax({
                    type:"get",
                    url:"/api/district/getBrothersByName?name="+testName+"",
                    async:false,
                    success:function(data){
                        if(data.state=="success"){
                            flag=false;
                        }else{
                            flag=true;
                        }
                    },
                    error:function(data){
                        alert(data.state);
                    }
                });
            }
            return flag;
        };
        //获取数据方法
        var getData=function(name,type){
            var url,data_str;
            if(type==1){            //1,子节点，2兄弟节点
                url="/api/district/getSonsByName?name="+name+""
            }else{
                url="/api/district/getBrothersByName?name="+name+""
            }
            $.ajax({
                    type:"get",
                    url:url,
                    async:false,
                    success:function(data){
                        if(data.state=="success"){
                            data_str=data;
                        }
                    },
                    error:function(data){
                        alert(data.state);
                    }
            });
            return data_str;
        }
        //一级初始，省级错误或者无
        var defaultInit=function(){
            // console.log('1');
            $.get("/api/district/getProvinces",function(data){
                if(data.state=="success"){
                    var str=handleData(data,1);
                    var provinceStr=(defaults.provinceStr+=str);
                }else{
                    alert(data.state);
                }
                $('#distprovince_id').html(provinceStr);
                $('#distcity_id').html(defaults.cityStr);
                $('#distarea_id').html(defaults.areaStr);
                $('#distroad_id').html(defaults.roadStr);
            });
        }
        //二级初始，省级正确，市级正确或错误
        var Init_Sec=function(){
            // console.log('2');
            //获取省级数据
            //2,表获取兄弟节点
            data_province=getData(provinceName,2);
            //2表部分初始
            var province_str=handleData( data_province,2);
            var provinceStr=(defaults.provinceStr+province_str);
            $('#distprovince_id').html(provinceStr);
            //获取市级数据
            data_city=getData(provinceName,1);
            var city_str;
            var area_str,areaStr;
            if(isInit_city){    //市级错误按全部初始执行
                city_str=handleData(data_city,1);
                $('#distarea_id').html(defaults.areaStr);
            }else{              //市级正确
                city_str=handleData(data_city,2);
                //获取区数据
                data_area=getData(cityName,1);
                area_str=handleData(data_area,1);
                areaStr=(defaults.areaStr+area_str);
                $('#distarea_id').html(areaStr);
            }
            if(isspe){
                $('#distarea_id').css('display','none');
                $('#distroad_id').css('display','none');
            }
            cityStr=(defaults.cityStr+city_str);
            $('#distcity_id').html(cityStr);
            //街道默认初始
            $('#distroad_id').html(defaults.roadStr);
        }
        //三级初始，省级正确，市级正确，区级正确或错误
        var Init_Thr=function(){
            // console.log('3');
            //获取省级数据
            data_province=getData(provinceName,2);
            var province_str=handleData( data_province,2);
            var provinceStr=(defaults.provinceStr+province_str);
            $('#distprovince_id').html(provinceStr);
            //获取市级数据
            if(ismun){          //如果为直辖市
                var opt=$('#distprovince_id').find("option:selected");
                var id=opt.attr("data-id");
                var cityStr=defaults.cityStr+"<option selected value="+provinceName+" data-id="+id+">"+provinceName+"</option>";
            }else{
                data_city=getData(provinceName,1);
                var city_str=handleData( data_city,2);
                var cityStr=defaults.cityStr+city_str;
            }
            $('#distcity_id').html(cityStr);
            if(isspe){          //如果初始地址为特殊区，则直接返回，隐藏区和街道
                $('#distarea_id').css('display','none');
                $('#distroad_id').css('display','none');
                return false;
            }
            //获取区级数据
            data_area=getData(cityName,1);
            var area_str,areaStr;
            var road_str,roadStr;
            if(isInit_area){        //区级错误
                area_str=handleData(data_area,1);
                $('#distroad_id').html(defaults.roadStr);
            }else{                  //区级正确
                area_str=handleData(data_area,2);
                //获取街道数据
                data_road=getData(areaName,1);
                //如果存在街道数据则街道一定正确
                road_str=(roadName==""?handleData(data_road,1):handleData(data_road,2))
                roadStr=(defaults.roadStr+road_str);
                $('#distroad_id').html(roadStr);
            }
            areaStr=(defaults.areaStr+area_str);
            $('#distarea_id').html(areaStr);
        }
        //处理数据
        var  initObj=function(AddrObj){
            if(municipalityArr.indexOf(provinceName)>=0){
                ismun=true;
                if(cityName!==provinceName){
                    areaName=cityName;
                    cityName=provinceName; 
                }
            }
            (specialAdd.indexOf(provinceName)>=0)&&(isspe=true);
        }
        //判断当前数据
        var judge=function(){
            isInit_province=Test_Func(provinceName);
            if(!isInit_province){
                isInit_city=Test_Func(cityName);
                if(!isInit_city){
                    isInit_area=Test_Func(areaName);
                    Init_Thr();     //区级初始
                }else{      //市级初始
                    Init_Sec();     
                }
            }else{  //省级初始
                defaultInit();
            }
        }
        //处理获得的地址对象，判断是否为特殊地区
        initObj(AddrObj);
        //执行判断，并选择初始
        judge();
    }
  });
})(jQuery);
