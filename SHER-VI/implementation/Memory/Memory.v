// Quartus Prime Verilog Template
// Single port RAM with single read/write address 

module Memory 
#(parameter DATA_WIDTH=16, parameter ADDR_WIDTH = 15)
(
	input [(DATA_WIDTH - 1):0] arg,
	input [(DATA_WIDTH - 1):0] data,
	input [(DATA_WIDTH - 1):0] sr1,
	input [(DATA_WIDTH - 1):0] sr2,
	input [(DATA_WIDTH - 1):0] sr3,
	input [(DATA_WIDTH - 1):0] rd,
	input [(DATA_WIDTH - 1):0] pc,
	input [(DATA_WIDTH - 1):0] two,
	input MEMWRITE, WRITEZERO, clk, reset,
	output [(DATA_WIDTH - 1):0] IRO,
	output [(DATA_WIDTH - 1):0] IRT,
	output [(DATA_WIDTH - 1):0] out1,
	output [(DATA_WIDTH - 1):0] out2,
	output [(DATA_WIDTH - 1):0] out3,
	output [(DATA_WIDTH - 1):0] return
);

	// Declare the RAM variable
	reg [(DATA_WIDTH - 1):0] ram [2**(ADDR_WIDTH) - 1:0];

	// Variable to hold the registered read address
	reg [(DATA_WIDTH - 1):0] addr_regPC;
	reg [(DATA_WIDTH - 1):0] addr_regPC2;
	reg [(DATA_WIDTH - 1):0] addr_reg1;
	reg [(DATA_WIDTH - 1):0] addr_reg2;
	reg [(DATA_WIDTH - 1):0] addr_reg3;

	//Instructions
	//Relprime

initial begin
	$readmemb("mem.txt", ram);
end

always @( posedge reset)
begin
	ram[130] <= arg;
	ram[129] <= 0;
	ram[2 ** (ADDR_WIDTH - 1)] <= 0;
end
	always @ (posedge clk)
	begin	
		//$display("Data: %d, rd: %d, MEMWRITE: %d, IRO: %d, IRT: %d", data, rd, MEMWRITE, IRO, IRT);
		// Write
		if (MEMWRITE)
			ram[rd / 2] <= data;
		if (WRITEZERO)
			ram[two / 2] <= 0;
	
		
	end

	// Continuous assignment implies read returns NEW data.
	// This is the natural behavior of the TriMatrix memory
	// blocks in Single Port mode.  
	always @ (pc or two or sr1 or sr2 or sr3)
begin
		addr_regPC <= (pc >> 1);
		addr_regPC2 <= (two >> 1);
		addr_reg1 <= (sr1 >> 1);
		addr_reg2 <= (sr2 >> 1);
		addr_reg3 <= (sr3 >>  1);
		//$display("sr1 = %d, addr_reg1 = %d, ram[addr_reg1] = %d", sr1, addr_reg1, ram[addr_reg1]);
		
end
	assign IRO = ram[addr_regPC];
	assign IRT = ram[addr_regPC2];
	assign out1 = ram[addr_reg1];
	assign out2 = ram[addr_reg2];
	assign out3 = ram[addr_reg3];
	assign return = ram[129];



endmodule
