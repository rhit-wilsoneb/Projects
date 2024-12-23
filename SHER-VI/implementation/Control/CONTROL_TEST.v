`timescale 1 ns / 1 ps
module CONTROL_TEST();

	parameter HALF_PERIOD = 50;
	
	reg CLK;
	reg reset;
	reg [4:0]       code;
   wire unsigned COMMON;
	wire unsigned SPWRITE;
	wire unsigned TSPWRITE;
	wire unsigned WRITEZERO;
	wire unsigned MEMWRITE;
	wire unsigned SKIPCMP;
   wire unsigned GENERIC;
   wire unsigned [3:0]current_state;
   wire unsigned [1:0] DATAIN;
	
	
	SHER_VI_CONTROL UUT
(
	.code(code) ,	// input [4:0] code_sig
	.CLK(CLK) ,	// input  CLK_sig
	.Reset(reset) ,	// input  Reset_sig
	.COMMON(COMMON) ,	// output  COMMON_sig
	.SPWRITE(SPWRITE) ,	// output  SPWRITE_sig
	.TSPWRITE(TSPWRITE) ,	// output  TSPWRITE_sig
	.WRITEZERO(WRITEZERO) ,	// output  WRITEZERO_sig
	.MEMWRITE(MEMWRITE) ,	// output  MEMWRITE_sig
	.SKIPCMP(SKIPCMP) ,	// output  SKIPCMP_sig
	.GENERIC(GENERIC) ,	// output  GENERIC_sig
	.current_state(current_state) , //output current_state_sig
	.DATAIN(DATAIN) 	// output [1:0] DATAIN_sig
);

initial begin
 CLK = 0;
 forever begin
	#(HALF_PERIOD);
	CLK = ~CLK;
end
end

initial begin
	CLK = 0;
	reset = 1;
	code = 0;
	#(10 * HALF_PERIOD);
	reset = 0;
	#(10 * HALF_PERIOD);
	//Make
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	//Testing Make
	code = 0;
	
	$display("Testing Make");
	repeat(3)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end
	
	$display("Testing AddSP");
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	code = 1;
	repeat(3)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end

	$display("Testing SubSP");
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	code = 5;
	repeat(3)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end
	
	$display("Testing Arithmetic");
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	code = 2;
	repeat(5)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end

	$display("Testing Branch");
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	code = 3;
	repeat(5)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end

	$display("Testing Jump");
	reset = 1;
	#(2 * HALF_PERIOD);
	reset = 0;
	code = 19;
	repeat(5)
	begin
	#( HALF_PERIOD);
		$display("STATE: %d, Common: %d, SPWrite: %d, TSPWrite: %d, WriteZero: %d, MemWrite: %d, SkipCmp: %d, Generic: %d, DataIn: %d", current_state, COMMON, SPWRITE, TSPWRITE, WRITEZERO, MEMWRITE, SKIPCMP, GENERIC, DATAIN);
	#( HALF_PERIOD);	
	end
$stop;
end
	
endmodule