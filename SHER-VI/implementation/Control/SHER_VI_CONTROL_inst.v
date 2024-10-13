// Copyright (C) 2018  Intel Corporation. All rights reserved.
// Your use of Intel Corporation's design tools, logic functions 
// and other software and tools, and its AMPP partner logic 
// functions, and any output files from any of the foregoing 
// (including device programming or simulation files), and any 
// associated documentation or information are expressly subject 
// to the terms and conditions of the Intel Program License 
// Subscription Agreement, the Intel Quartus Prime License Agreement,
// the Intel FPGA IP License Agreement, or other applicable license
// agreement, including, without limitation, that your use is for
// the sole purpose of programming logic devices manufactured by
// Intel and sold by Intel or its authorized distributors.  Please
// refer to the applicable agreement for further details.


// Generated by Quartus Prime Version 18.1 (Build Build 625 09/12/2018)
// Created on Sun Apr 28 10:54:28 2024

SHER_VI_CONTROL SHER_VI_CONTROL_inst
(
	.code(code_sig) ,	// input [4:0] code_sig
	.CLK(CLK_sig) ,	// input  CLK_sig
	.Reset(Reset_sig) ,	// input  Reset_sig
	.COMMON(COMMON_sig) ,	// output  COMMON_sig
	.SPWRITE(SPWRITE_sig) ,	// output  SPWRITE_sig
	.TSPWRITE(TSPWRITE_sig) ,	// output  TSPWRITE_sig
	.WRITEZERO(WRITEZERO_sig) ,	// output  WRITEZERO_sig
	.MEMWRITE(MEMWRITE_sig) ,	// output  MEMWRITE_sig
	.SKIPCMP(SKIPCMP_sig) ,	// output  SKIPCMP_sig
	.GENERIC(GENERIC_sig) ,	// output  GENERIC_sig
	.DATAIN(DATAIN_sig) 	// output [1:0] DATAIN_sig
);

defparam SHER_VI_CONTROL_inst.Fetch = 0;
defparam SHER_VI_CONTROL_inst.Make = 1;
defparam SHER_VI_CONTROL_inst.SubSP = 2;
defparam SHER_VI_CONTROL_inst.AddSP = 3;
defparam SHER_VI_CONTROL_inst.Load = 4;
defparam SHER_VI_CONTROL_inst.Logic = 5;
defparam SHER_VI_CONTROL_inst.Ari = 6;
defparam SHER_VI_CONTROL_inst.Branch = 7;
defparam SHER_VI_CONTROL_inst.Jump = 8;
