/////////////////////////////////////////
/////////////////////////////////////////
// Ethan Wilson
// Rose-Hulman
//
// Create Date: 5/12/2024
// Design Name: S.H.E.R IV Architecture
// Project Name: CSSE232 Final Project
/////////////////////////////////////////
/////////////////////////////////////////



module SHERVIModule
#(parameter DATA_WIDTH = 16)
(
	input signed [(DATA_WIDTH - 1):0] arg,
	input unsigned CLK,
	input unsigned reset,
	output signed [(DATA_WIDTH - 1):0] return,
	output stop
);


//Set Up Wires
//Control Wires
wire unsigned TSPWRITE;
wire unsigned GENERIC;
wire unsigned MEMWRITE;
wire unsigned WRITEZERO;
wire unsigned SPWRITE;
wire unsigned SKIPCMP;
wire unsigned [1:0] DATAIN;
wire unsigned COMMON;
wire unsigned RESETCMP;

//Register Input and Output Wires
	//Memory
wire unsigned [DATA_WIDTH - 1:0] IRO_IN;
wire unsigned [DATA_WIDTH - 1:0] IRT_IN;
wire unsigned [DATA_WIDTH - 1:0] IRO;
wire unsigned [DATA_WIDTH - 1:0] IRT;

//PC_IN is a mux output
wire unsigned [DATA_WIDTH - 1:0] PC;
//TSP_IN is an adder output
//wire unsigned [DATA_WIDTH - 1:0] TSP_IN;
wire unsigned [DATA_WIDTH - 1:0] TSP;
//SP_IN is a mux output
wire unsigned [DATA_WIDTH - 1:0] SP;
	//Data
wire signed [DATA_WIDTH - 1:0] ALUOUT_IN;
wire signed [DATA_WIDTH - 1:0] ALUOUT;
wire signed [DATA_WIDTH - 1:0] A_IN;
wire signed [DATA_WIDTH - 1:0] A;
wire signed [DATA_WIDTH - 1:0] B_IN;
wire signed [DATA_WIDTH - 1:0] B;
wire signed [DATA_WIDTH - 1:0] C_IN;
wire signed [DATA_WIDTH - 1:0] C;
	//Compare
wire unsigned CMP_IN;
wire unsigned CMP;

//Mux Output Wires
	//Data
//data1 is ALUOUT and PC muxed
//data2 is data1 and imm muxed
wire signed [DATA_WIDTH - 1:0] data1;
wire signed [DATA_WIDTH - 1:0] data2;
	//Memory
wire signed [DATA_WIDTH - 1:0] rd;
wire signed [DATA_WIDTH - 1:0] TWO_IN;
wire signed [DATA_WIDTH - 1:0] PC_IN;
wire signed [DATA_WIDTH - 1:0] SP_IN;

//Adder Output Wires
	//Memory
wire signed [DATA_WIDTH - 1:0] PC4;
wire signed [DATA_WIDTH - 1:0] TWO;
wire signed [DATA_WIDTH - 1:0] pointer;
	//Data
wire signed [DATA_WIDTH - 1:0] sr1;
wire signed [DATA_WIDTH - 1:0] sr2;
	//Both
wire signed [DATA_WIDTH - 1:0] three;

//Shifter Output Wires
wire signed [DATA_WIDTH - 1:0] sr1Offset;
wire signed [DATA_WIDTH - 1:0] sr2Offset;
wire signed [DATA_WIDTH - 1:0] threeOffset;
wire signed [DATA_WIDTH - 1:0] pointerOffset;

//Logic Output Wires
wire unsigned SPWRITE_WRITE;
wire unsigned COMMON_WRITE;
wire unsigned MEMWRITE_WRITE;
wire unsigned WRITEZERO_CMP;
wire unsigned WRITE;

//Sign-Extend Out
wire signed [DATA_WIDTH - 1:0] immediate;



//Components
ALU ALU_inst
(
	.funct3(IRO[4:2]) ,	// input [2:0] funct3_sig
	.A(A) ,	// input [15:0] A_sig
	.B(B) ,	// input [15:0] B_sig
	.ALUOUT(ALUOUT_IN) ,	// output [15:0] ALUOUT_sig
	.cmp(CMP_IN) 	// output  cmp_sig
);

SHER_VI_CONTROL SHER_VI_CONTROL_inst
(
	.code(IRO[4:0]) ,	// input [4:0] code_sig
	.CLK(CLK) ,	// input  CLK_sig
	.Reset(reset) ,	// input  Reset_sig
	.COMMON(COMMON) ,	// output  COMMON_sig
	.SPWRITE(SPWRITE) ,	// output  SPWRITE_sig
	.TSPWRITE(TSPWRITE) ,	// output  TSPWRITE_sig
	.WRITEZERO(WRITEZERO) ,	// output  WRITEZERO_sig
	.MEMWRITE(MEMWRITE) ,	// output  MEMWRITE_sig
	.SKIPCMP(SKIPCMP) ,	// output  SKIPCMP_sig
	.GENERIC(GENERIC) ,	// output  GENERIC_sig
	.DATAIN(DATAIN) 	// output [1:0] DATAIN_sig
);

Memory Memory_inst
(
	.arg(arg),
	.data(data2) ,	// input [DATA_WIDTH-1:0] data_sig
	.sr1(sr1) ,	// input [DATA_WIDTH-1:0] sr1_sig
	.sr2(sr2) ,	// input [DATA_WIDTH-1:0] sr2_sig
	.sr3(three) ,	// input [DATA_WIDTH-1:0] sr3_sig
	.rd(rd) ,	// input [DATA_WIDTH-1:0] rd_sig
	.pc(PC) ,	// input [DATA_WIDTH-1:0] pc_sig
	.two(TWO) ,	// input [DATA_WIDTH-1:0] two_sig
	.MEMWRITE(MEMWRITE) ,	// input  MEMWRITE_sig
	.WRITEZERO(WRITEZERO) ,	// input  WRITEZERO_sig
	.clk(CLK) ,	// input  clk_sig
	.reset(reset),
	.IRO(IRO_IN) ,	// output [DATA_WIDTH-1:0] IRO_sig
	.IRT(IRT_IN) ,	// output [DATA_WIDTH-1:0] IRT_sig
	.out1(A_IN) ,	// output [DATA_WIDTH-1:0] out1_sig
	.out2(B_IN) ,	// output [DATA_WIDTH-1:0] out2_sig
	.out3(C_IN), 	// output [DATA_WIDTH-1:0] out3_sig
	.return(return)
);

//Registers
register PC_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(PC_IN) ,	// input [15:0] data_in_sig
	.ctrl(COMMON_WRITE) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(PC) 	// output [15:0] data_out_sig
);

SPregister SP_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(SP_IN) ,	// input [15:0] data_in_sig
	.ctrl(SPWRITE_WRITE) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(SP) 	// output [15:0] data_out_sig
);

register TSP_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(pointer) ,	// input [15:0] data_in_sig
	.ctrl(TSPWRITE) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(TSP) 	// output [15:0] data_out_sig
);

register CMP_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(CMP_IN) ,	// input [15:0] data_in_sig
	.ctrl(1) ,	// input  ctrl_sig
	.reset(RESETCMP) ,	// input  reset_sig
	.data_out(CMP) 	// output [15:0] data_out_sig
);

register A_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(A_IN) ,	// input [15:0] data_in_sig
	.ctrl(1) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(A) 	// output [15:0] data_out_sig
);

register B_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(B_IN) ,	// input [15:0] data_in_sig
	.ctrl(1) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(B) 	// output [15:0] data_out_sig
);

register C_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(C_IN) ,	// input [15:0] data_in_sig
	.ctrl(GENERIC) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(C) 	// output [15:0] data_out_sig
);

register ALUOUT_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(ALUOUT_IN) ,	// input [15:0] data_in_sig
	.ctrl(1) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(ALUOUT) 	// output [15:0] data_out_sig
);

register IRO_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(IRO_IN) ,	// input [15:0] data_in_sig
	.ctrl(COMMON) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(IRO) 	// output [15:0] data_out_sig
);

register IRT_inst
(
	.clk(CLK) ,	// input  clk_sig
	.data_in(IRT_IN) ,	// input [15:0] data_in_sig
	.ctrl(COMMON) ,	// input  ctrl_sig
	.reset(reset) ,	// input  reset_sig
	.data_out(IRT) 	// output [15:0] data_out_sig
);

//Shifters

SL Sr2_SL_inst
(
	.data_in({{16{0}},{IRT[6:0], IRO[15:14]}}) ,	// input [15:0] data_in_sig
	.data_out(sr2Offset) 	// output [15:0] data_out_sig
);

SL Sr1_SL_inst
(
	.data_in({{16{0}},IRO[13:5]}) ,	// input [15:0] data_in_sig
	.data_out(sr1Offset) 	// output [15:0] data_out_sig
);

SL Three_SL_inst
(
	.data_in({{16{0}},IRT[15:7]}) ,	// input [15:0] data_in_sig
	.data_out(threeOffset) 	// output [15:0] data_out_sig
);

SL Pointer_SL_inst
(
	//This was changed for 16-bit
	.data_in({{16{0}},IRO[15:3]}) ,	// input [15:0] data_in_sig
	.data_out(pointerOffset) 	// output [15:0] data_out_sig
);

//Muxes
//0 Returns A, 1 Returns B
mux1b2 PC_Select
(
	.data_A(C) ,	// input [15:0] data_A_sig
	.data_B(PC4) ,	// input [15:0] data_B_sig
	.ctrl(GENERIC) ,	// input  ctrl_sig
	.data_out(PC_IN) 	// output [15:0] data_out_sig
);

mux1b2 TWO_Select
(
	.data_A(TSP) ,	// input [15:0] data_A_sig
	.data_B(PC) ,	// input [15:0] data_B_sig
	.ctrl(GENERIC) ,	// input  ctrl_sig
	.data_out(TWO_IN) 	// output [15:0] data_out_sig
);

mux1b2 rd_select
(
	.data_A(three) ,	// input [15:0] data_A_sig
	.data_B(TSP) ,	// input [15:0] data_B_sig
	.ctrl(COMMON) ,	// input  ctrl_sig
	.data_out(rd) 	// output [15:0] data_out_sig
);

mux1b2 TSP_select
(
	.data_A(pointer) ,	// input [15:0] data_A_sig
	.data_B(TSP) ,	// input [15:0] data_B_sig
	.ctrl(COMMON) ,	// input  ctrl_sig
	.data_out(SP_IN) 	// output [15:0] data_out_sig
);

mux1b2 data1_select
(
	.data_A(immediate) ,	// input [15:0] data_A_sig
	.data_B(PC) ,	// input [15:0] data_B_sig
	.ctrl(DATAIN[1:1]) ,	// input  ctrl_sig
	.data_out(data1) 	// output [15:0] data_out_sig
);

mux1b2 data2_select
(
	.data_A(data1) ,	// input [15:0] data_A_sig
	.data_B(ALUOUT) ,	// input [15:0] data_B_sig
	.ctrl(DATAIN[0:0]) ,	// input  ctrl_sig
	.data_out(data2) 	// output [15:0] data_out_sig
);

//Adders
adder PC4_ADD_inst
(
	.data_A(PC) ,	// input [15:0] data_A_sig
	.data_B(4) ,	// input [15:0] data_B_sig
	.sub(1'b0),
	.data_out(PC4) 	// output [15:0] data_out_sig
);

adder TWO_ADD_inst
(
	.data_A(TWO_IN) ,	// input [15:0] data_A_sig
	.data_B(2) ,	// input [15:0] data_B_sig
	.sub(1'b0),
	.data_out(TWO) 	// output [15:0] data_out_sig
);

adder sr1_ADD_inst
(
	.data_A(sr1Offset) ,	// input [15:0] data_A_sig
	.data_B(SP) ,	// input [15:0] data_B_sig
	.sub(1'b0),
	.data_out(sr1) 	// output [15:0] data_out_sig
);

adder sr2_ADD_inst
(
	.data_A(sr2Offset) ,	// input [15:0] data_A_sig
	.data_B(SP) ,	// input [15:0] data_B_sig
	.sub(1'b0),
	.data_out(sr2) 	// output [15:0] data_out_sig
);

adder three_ADD_inst
(
	.data_A(threeOffset) ,	// input [15:0] data_A_sig
	.data_B(SP) ,	// input [15:0] data_B_sig
	.sub(1'b0),
	.data_out(three) 	// output [15:0] data_out_sig
);

adder pointer_ADD_inst
(
	.data_A(SP) ,	// input [15:0] data_A_sig
	.data_B(pointerOffset) ,	// input [15:0] data_B_sig
	.sub(IRO[2:2]),
	.data_out(pointer) 	// output [15:0] data_out_sig
);

//Logical Assignments
assign WRITE = SKIPCMP | CMP;
assign SPWRITE_WRITE = SPWRITE & WRITE;
assign WRITEZERO_CMP = CMP & WRITEZERO;
assign MEMWRITE_WRITE = MEMWRITE & WRITE;
assign COMMON_WRITE = WRITE & COMMON;
assign RESETCMP = reset | COMMON;
//Sign extention of immediate
assign immediate = {{16{IRO[15:15]}},IRO[15:2]};



endmodule