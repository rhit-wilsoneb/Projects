`timescale 1 ns / 1 ps
module Testbench();

parameter HALF_PERIOD = 50;


reg CLK;
reg reset;
reg[15:0] arg;
wire signed [15:0] return;
reg [15:0] output1;
reg [15:0] output2;


SHERVIModule main_inst
(
	.arg(arg) ,
	.CLK(CLK) ,	
	.reset(reset) ,	
	.return(return) 	
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
arg =  5040;

#(10 * HALF_PERIOD);

reset = 0;

@(return != 0);
output1 = return;
$display("The relative prime of %d = %d", arg, return);

reset = 1;
arg = 40;				
#(10 * HALF_PERIOD);
reset = 0;
@(return != 0);
output2 = return;
$display("The relative prime of %d = %d", arg, return);


$stop();

end

endmodule